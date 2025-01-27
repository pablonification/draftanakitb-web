module.exports = {
  apps: [
    {
      name: 'draftanakitb-web',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',  // Increased from 1G to 2G
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
