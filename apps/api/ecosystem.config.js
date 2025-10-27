/**
 * PM2 Ecosystem Configuration
 * For production-grade process management and clustering
 */

module.exports = {
  apps: [
    {
      name: 'restaurant-api',
      script: './dist/index.js',
      
      // Clustering configuration (use all CPU cores)
      instances: 'max', // or specific number like 4
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      
      // Auto restart configuration
      watch: false, // Don't watch files in production
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      autorestart: true, // Auto restart on crash
      max_restarts: 10, // Max restarts within min_uptime
      min_uptime: '10s', // Min uptime to consider app stable
      listen_timeout: 3000, // Time to wait for app to listen
      kill_timeout: 5000, // Time to wait before forcing kill
      
      // Graceful shutdown
      shutdown_with_message: true,
      wait_ready: true,
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Load balancing
      instance_var: 'INSTANCE_ID',
      
      // Performance monitoring
      pmx: true,
      
      // Source map support
      source_map_support: true,
    },
    
    // Development mode configuration
    {
      name: 'restaurant-api-dev',
      script: 'ts-node',
      args: 'src/index.ts',
      instances: 1,
      exec_mode: 'fork',
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};






