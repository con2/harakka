module.exports = {
  apps: [
    {
      name: "booking-app-backend",
      script: "dist/main.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/home/LogFiles/application/error.log",
      out_file: "/home/LogFiles/application/out.log",
      merge_logs: true,
      post_update: ["node dist/warmup.js"],
    },
  ],
};
