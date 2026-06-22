import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from './models/Category';
import Product from './models/Product';
import User from './models/User';
import connectDB from './config/database';

async function seedSample() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully.\n');

    // ─── Ensure admin user exists ───
    const adminEmail = 'lorndavid@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Lorn David',
        email: adminEmail,
        password: '150505',
        role: 'admin',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // ─── Categories ───
    const categoryData = [
      { name: 'Electronics', icon: '📱' },
      { name: 'Fashion', icon: '👕' },
      { name: 'Home & Living', icon: '🏠' },
      { name: 'Beauty', icon: '💄' },
      { name: 'Sports', icon: '⚽' },
      { name: 'Books', icon: '📚' },
      { name: 'Food & Drinks', icon: '🍕' },
      { name: 'Accessories', icon: '⌚' },
    ];

    // Delete old categories and re-create
    await Category.deleteMany({});
    const categories = await Category.insertMany(categoryData);
    console.log(`✅ ${categories.length} categories created`);

    // Map category names to IDs
    const catMap: Record<string, string> = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id.toString();
    });

    // ─── Products ───
    const productData = [
      // Electronics
      { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, comfortable ear cups, and built-in microphone for calls.', price: 79.99, stock: 50, discount: 20, category: catMap['Electronics'], rating: 4.5, numReviews: 128, sold: 340, featured: true },
      { name: 'Smart Watch Pro', description: 'Advanced smartwatch with heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water resistant to 50m.', price: 199.99, stock: 30, discount: 15, category: catMap['Electronics'], rating: 4.3, numReviews: 89, sold: 210, featured: true },
      { name: 'Portable Bluetooth Speaker', description: 'Compact waterproof speaker with 360-degree sound. 12-hour playtime, built-in power bank, and dustproof design.', price: 49.99, stock: 80, discount: 10, category: catMap['Electronics'], rating: 4.6, numReviews: 201, sold: 520, featured: false },
      { name: 'USB-C Hub 7-in-1', description: 'Multi-port adapter with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging. Compatible with all USB-C devices.', price: 34.99, stock: 120, discount: 0, category: catMap['Electronics'], rating: 4.2, numReviews: 56, sold: 180, featured: false },
      { name: 'Wireless Charging Pad', description: 'Fast wireless charger compatible with all Qi devices. 15W fast charge with intelligent temperature control.', price: 24.99, stock: 200, discount: 25, category: catMap['Electronics'], rating: 4.0, numReviews: 312, sold: 890, featured: true },

      // Fashion
      { name: 'Classic Cotton T-Shirt', description: 'Premium 100% organic cotton t-shirt. Comfortable fit, breathable fabric, and reinforced stitching. Available in multiple colors.', price: 29.99, stock: 150, discount: 0, category: catMap['Fashion'], rating: 4.4, numReviews: 450, sold: 1200, featured: true },
      { name: 'Slim Fit Denim Jeans', description: 'Modern slim-fit jeans made from premium stretch denim. Features 5-pocket design, button closure, and zip fly.', price: 59.99, stock: 80, discount: 10, category: catMap['Fashion'], rating: 4.1, numReviews: 178, sold: 560, featured: false },
      { name: 'Summer Dress Floral', description: 'Lightweight floral dress perfect for summer. Made from soft viscose fabric with an adjustable waist tie.', price: 44.99, stock: 60, discount: 30, category: catMap['Fashion'], rating: 4.7, numReviews: 92, sold: 340, featured: true },
      { name: 'Leather Crossbody Bag', description: 'Genuine leather crossbody bag with adjustable strap. Multiple compartments with RFID blocking technology.', price: 89.99, stock: 40, discount: 15, category: catMap['Fashion'], rating: 4.5, numReviews: 67, sold: 190, featured: false },
      { name: 'Running Shoes Ultra', description: 'Lightweight running shoes with responsive cushioning. Breathable mesh upper with reflective details for night runs.', price: 119.99, stock: 55, discount: 20, category: catMap['Fashion'], rating: 4.6, numReviews: 234, sold: 780, featured: true },

      // Home & Living
      { name: 'Scented Candle Set', description: 'Set of 3 premium soy wax candles. Long-lasting 45-hour burn time each. Available in vanilla, lavender, and ocean breeze.', price: 34.99, stock: 90, discount: 0, category: catMap['Home & Living'], rating: 4.3, numReviews: 145, sold: 410, featured: false },
      { name: 'Bamboo Cutting Board', description: 'Large organic bamboo cutting board with juice groove. Naturally antimicrobial and knife-friendly surface.', price: 27.99, stock: 70, discount: 5, category: catMap['Home & Living'], rating: 4.4, numReviews: 88, sold: 250, featured: false },
      { name: 'Cozy Throw Blanket', description: 'Ultra-soft microfiber throw blanket. Perfect for couch or bed. Machine washable and fade resistant. 60x80 inches.', price: 39.99, stock: 100, discount: 15, category: catMap['Home & Living'], rating: 4.8, numReviews: 312, sold: 920, featured: true },

      // Beauty
      { name: 'Vitamin C Serum', description: 'Advanced 20% Vitamin C serum with hyaluronic acid. Brightens skin, reduces dark spots, and boosts collagen production.', price: 28.99, stock: 75, discount: 10, category: catMap['Beauty'], rating: 4.5, numReviews: 267, sold: 680, featured: true },
      { name: 'Moisturizing Face Cream', description: 'Rich daily moisturizer with SPF 30. Hydrates and protects with natural ingredients including shea butter and aloe vera.', price: 32.99, stock: 65, discount: 0, category: catMap['Beauty'], rating: 4.2, numReviews: 156, sold: 430, featured: false },
      { name: 'Lipstick Collection', description: 'Set of 6 long-lasting matte lipsticks. Rich pigment with moisturizing formula. Cruelty-free and paraben-free.', price: 24.99, stock: 110, discount: 20, category: catMap['Beauty'], rating: 4.1, numReviews: 89, sold: 510, featured: false },

      // Sports
      { name: 'Yoga Mat Premium', description: 'Extra thick 6mm yoga mat with alignment lines. Non-slip surface, eco-friendly TPE material, includes carrying strap.', price: 45.99, stock: 45, discount: 5, category: catMap['Sports'], rating: 4.6, numReviews: 198, sold: 540, featured: false },
      { name: 'Resistance Band Set', description: 'Set of 5 resistance bands with different tension levels. Includes door anchor, handles, ankle straps, and carrying bag.', price: 19.99, stock: 130, discount: 0, category: catMap['Sports'], rating: 4.3, numReviews: 78, sold: 320, featured: false },
      { name: 'Insulated Water Bottle', description: 'Double-wall vacuum insulated water bottle. Keeps drinks cold 24h or hot 12h. 750ml capacity, BPA-free stainless steel.', price: 29.99, stock: 200, discount: 10, category: catMap['Sports'], rating: 4.7, numReviews: 445, sold: 1100, featured: true },

      // Books
      { name: 'The Art of Coding', description: 'Comprehensive guide to modern software development. Covers algorithms, data structures, design patterns, and best practices.', price: 42.99, stock: 40, discount: 0, category: catMap['Books'], rating: 4.8, numReviews: 56, sold: 120, featured: false },
      { name: 'Cambodian Cookbook', description: 'Authentic Cambodian recipes from traditional Khmer cuisine. 120 recipes with beautiful photography and cultural stories.', price: 34.99, stock: 35, discount: 10, category: catMap['Books'], rating: 4.5, numReviews: 34, sold: 80, featured: false },

      // Food & Drinks
      { name: 'Premium Green Tea', description: 'Premium Japanese green tea leaves. Rich in antioxidants, smooth flavor, 50 tea bags per box. Harvested from Kyoto.', price: 18.99, stock: 100, discount: 0, category: catMap['Food & Drinks'], rating: 4.4, numReviews: 167, sold: 430, featured: false },
      { name: 'Organic Honey Jar', description: 'Pure wildflower honey from Cambodian highlands. Raw, unfiltered, and non-GMO. 500g glass jar.', price: 15.99, stock: 60, discount: 5, category: catMap['Food & Drinks'], rating: 4.6, numReviews: 89, sold: 210, featured: false },

      // Accessories
      { name: 'Sunglasses Polarized', description: 'Premium polarized sunglasses with UV400 protection. Lightweight titanium frame with scratch-resistant lenses.', price: 69.99, stock: 45, discount: 25, category: catMap['Accessories'], rating: 4.3, numReviews: 123, sold: 340, featured: true },
      { name: 'Leather Wallet RFID', description: 'Slim bifold wallet with RFID blocking. Genuine leather with 6 card slots, ID window, and hidden cash pocket.', price: 44.99, stock: 85, discount: 0, category: catMap['Accessories'], rating: 4.4, numReviews: 98, sold: 290, featured: false },
      { name: 'Silk Scarf', description: 'Handcrafted Cambodian silk scarf. Traditional patterns with modern design. 180cm x 70cm, perfect gift for any occasion.', price: 54.99, stock: 25, discount: 30, category: catMap['Accessories'], rating: 4.9, numReviews: 45, sold: 110, featured: true },
    ];

    await Product.deleteMany({});
    const products = await Product.insertMany(productData);
    console.log(`✅ ${products.length} products created`);

    // Summary
    console.log('\n═══════════════════════════════════');
    console.log('  SEED COMPLETE');
    console.log('═══════════════════════════════════');
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Products:   ${products.length}`);
    console.log(`  Admin:      ${adminEmail}`);
    console.log('═══════════════════════════════════\n');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedSample();
