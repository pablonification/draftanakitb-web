const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(express.json({ limit: '50mb' }))
  server.use(express.urlencoded({ limit: '50mb', extended: true }))

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  createServer(server).listen(port, hostname, (err) => {
    if (err) throw err
    
    // Signal that the server is ready
    if (process.send) {
      process.send('ready')
    }
    
    console.log(`> Ready on http://${hostname}:${port}`)
  })
  
  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Cleaning up...')
    process.exit()
  })
})
