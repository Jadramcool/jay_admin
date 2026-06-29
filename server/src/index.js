import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import systemRoutes from './routes/system.js'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/system', systemRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'OK', data: { status: 'running', time: new Date().toISOString() } })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null })
})

app.listen(PORT, () => {
  console.log(`\n  🚀 jdm-admin 后端服务已启动`)
  console.log(`  📡 地址: http://localhost:${PORT}`)
  console.log(`  📋 API: http://localhost:${PORT}/api`)
  console.log(`  🔑 默认账号: admin / admin123\n`)
})
