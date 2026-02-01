module.exports = {
  apps: [
    {
      name: 'garment-flow',
      script: 'npm',
      args: 'run dev',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production'
      },
      out_file: 'logs/pm2.out.log',
      error_file: 'logs/pm2.err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
