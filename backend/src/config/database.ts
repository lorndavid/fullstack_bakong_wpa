import mongoose from 'mongoose';
import dns from 'dns';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// Force Node.js to use Cloudflare DNS servers for all dns.resolve*() calls.
// On Windows, Node.js uses its own async resolver (c-ares) which may not pick up
// the system DNS servers correctly, causing SRV lookups to fail with ECONNREFUSED.
function setupDnsResolvers(): void {
  try {
    dns.setServers(['1.1.1.1', '1.0.0.1']);
    console.log('DNS servers set to 1.1.1.1, 1.0.0.1 for Node.js resolver');
  } catch (err: any) {
    console.warn('Could not set custom DNS servers:', err.message);
  }
}

/**
 * Convert a mongodb+srv:// URI to a standard mongodb:// URI.
 * This bypasses SRV DNS lookups which can fail on Windows with custom DNS.
 * Adds directConnection=true and ssl=true for Atlas compatibility.
 */
function convertSrvToStandard(uri: string): string {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const withoutProtocol = uri.slice('mongodb+srv://'.length);
  const atIndex = withoutProtocol.indexOf('@');
  if (atIndex === -1) return uri;

  const credentials = withoutProtocol.slice(0, atIndex);
  const rest = withoutProtocol.slice(atIndex + 1);

  const slashIndex = rest.indexOf('/');
  let hostname: string;
  let dbAndParams: string;

  if (slashIndex === -1) {
    hostname = rest;
    dbAndParams = '';
  } else {
    hostname = rest.slice(0, slashIndex);
    dbAndParams = rest.slice(slashIndex);
  }

  // Add required Atlas parameters
  const baseParams =
    'ssl=true&authSource=admin&retryWrites=true&w=majority&directConnection=true';
  const separator = dbAndParams.includes('?') ? '&' : '';
  const prefix = dbAndParams.includes('?') ? '' : '?';

  return `mongodb://${credentials}@${hostname}:27017${dbAndParams}${separator}${prefix}${baseParams}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI is required');
  }

  // Step 0: Set custom DNS servers to ensure SRV records resolve
  setupDnsResolvers();

  // Step 1: Try SRV first (original URI)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} (SRV)...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      const isSrvError =
        error.name === 'MongooseServerSelectionError' &&
        (error.message?.includes('querySrv') ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('SRV'));

      if (isSrvError && attempt === 1) {
        console.warn(
          'SRV DNS lookup failed (Node.js DNS resolver issue on Windows). ' +
            'Falling back to non-SRV connection...'
        );
        break; // Skip remaining SRV retries, go to non-SRV fallback
      }

      if (attempt < MAX_RETRIES) {
        console.warn(
          `SRV attempt ${attempt} failed (${error.message}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
        );
        await sleep(RETRY_DELAY_MS);
      } else {
        console.error(`All ${MAX_RETRIES} SRV connection attempts failed.`);
      }
    }
  }

  // Step 2: Fallback to non-SRV connection with directConnection=true
  const fallbackUri = convertSrvToStandard(uri);
  console.log(`Attempting non-SRV connection (bypasses DNS SRV lookup)...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
      });
      console.log(`MongoDB Connected (non-SRV): ${conn.connection.host}`);
      return;
    } catch (error: any) {
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Non-SRV attempt ${attempt} failed (${error.message}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
        );
        await sleep(RETRY_DELAY_MS);
      } else {
        console.error(
          `\n❌ MongoDB connection failed after all retries.`
        );
        console.error(`   Error: ${error.message}`);
        console.error(``);
        console.error(`   ─── DIAGNOSTIC ───`);
        console.error(`   1. Verify your MongoDB Atlas IP whitelist:`);
        console.error(`      Go to: https://cloud.mongodb.com`);
        console.error(`      → Network Access → Add IP Address`);
        console.error(`      → Add "0.0.0.0/0" (allow from anywhere) OR`);
        console.error(`      → Add your current public IP address`);
        console.error(``);
        console.error(`   2. Verify the cluster is running:`);
        console.error(`      → Clusters → check status (should be green)`);
        console.error(``);
        console.error(`   3. Flush DNS cache (run in terminal):`);
        console.error(`      ipconfig /flushdns`);
        console.error(``);
        console.error(`   4. Connection string: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
        console.error(``);
        console.error(`   The server will keep running. API endpoints will return`);
        console.error(`   errors until MongoDB is connected.`);
        throw error;
      }
    }
  }
};

export default connectDB;
