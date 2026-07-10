// ──────────────────────────────────────────────────────────────
// PM2 Ecosystem Configuration
// ──────────────────────────────────────────────────────────────
// This file centralizes PM2 process management settings.
// Instead of passing CLI flags like --update-env or
// --max-memory-restart, all config lives here.
//
// Usage:
//   pm2 start ecosystem.config.js            # Start
//   pm2 restart ecosystem.config.js          # Restart
//   pm2 reload ecosystem.config.js           # Zero-downtime reload
//   pm2 delete ecosystem.config.js           # Stop & remove
// ──────────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      // ─── Process Name ────────────────────────────────────
      // Used in: pm2 start/stop/restart myshop-backend
      name: 'myshop-backend',

      // ─── Entry Point ─────────────────────────────────────
      // Points to the symlinked "current" release directory.
      // deploy.sh updates this symlink atomically during
      // zero-downtime deployments.
      script: './current/dist/server.js',

      // ─── Execution Mode ──────────────────────────────────
      // 'fork' = single process (standard for Node.js)
      // 'cluster' = multiple instances (requires stateless app)
      exec_mode: 'fork',

      // ─── Node Environment ────────────────────────────────
      // 'production' enables Express production optimizations:
      //   - View caching
      //   - Stack traces hidden from responses
      //   - More aggressive error handling
      NODE_ENV: 'production',

      // ─── Environment Variables ───────────────────────────
      // Loaded from .env file on every start/reload.
      // --update-env flag forces re-reading these values.
      env: {
        PORT: 5000,
      },
      env_file: './.env',

      // ─── Memory Management ───────────────────────────────
      // Auto-restart if memory usage exceeds 500MB
      // Precludes slow memory leaks from accumulating
      max_memory_restart: '500M',

      // ─── Logging ─────────────────────────────────────────
      // PM2 captures stdout/stderr to these files.
      // Logs are rotated automatically via pm2-logrotate.
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // ─── Restart Behavior ────────────────────────────────
      // If the app crashes, wait 3 seconds before restarting
      restart_delay: 3000,
      // Maximum consecutive crashes before PM2 gives up
      max_restarts: 10,

      // ─── Watch Mode ──────────────────────────────────────
      // Disabled in production — use deploy.sh for updates
      watch: false,

      // ─── Graceful Shutdown ───────────────────────────────
      // When PM2 reloads, it sends SIGINT to the old process.
      // The app should catch this and close connections.
      kill_timeout: 5000,
      // Wait up to 5 seconds for existing connections to drain
      listen_timeout: 3000,
    },
  ],
};
