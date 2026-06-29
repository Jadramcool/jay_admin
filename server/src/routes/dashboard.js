import { Router } from 'express'
import db from '../data/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../utils/response.js'

const router = Router()

router.get('/stats', authMiddleware, (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLogs = db.operationLogs.filter(l => new Date(l.createdTime) >= today)

  // Calculate trends (compare with last period)
  const lastPeriod = new Date(today.getTime() - 7 * 86400000)
  const lastWeekUsers = db.users.filter(u => new Date(u.createdTime) >= lastPeriod && new Date(u.createdTime) < today).length
  const prevWeekUsers = db.users.filter(u => new Date(u.createdTime) >= new Date(lastPeriod.getTime() - 7 * 86400000) && new Date(u.createdTime) < lastPeriod).length

  res.json(success({
    userCount: db.users.length,
    userTrend: prevWeekUsers > 0 ? Math.round(((lastWeekUsers - prevWeekUsers) / prevWeekUsers) * 100 * 10) / 10 : lastWeekUsers > 0 ? 100 : 0,
    roleCount: db.roles.length,
    menuCount: db.menus.filter(m => m.type !== 'BUTTON').length,
    departmentCount: db.departments.length,
    logCount: db.operationLogs.length,
    logTodayCount: todayLogs.length,
    onlineCount: Math.floor(Math.random() * 10) + 3,
  }))
})

router.get('/trends', authMiddleware, (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 30)
  const dates = []
  const visits = []
  const newUsers = []
  const operations = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dates.push(dateStr)

    const dayStart = new Date(d)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setHours(23, 59, 59, 999)

    const dayLogs = db.operationLogs.filter((l) => {
      const t = new Date(l.createdTime).getTime()
      return t >= dayStart.getTime() && t <= dayEnd.getTime()
    })
    const dayUsers = db.users.filter((u) => {
      const t = new Date(u.createdTime).getTime()
      return t >= dayStart.getTime() && t <= dayEnd.getTime()
    })

    visits.push(dayLogs.length + Math.floor(Math.random() * 20))
    newUsers.push(dayUsers.length)
    operations.push(dayLogs.length)
  }

  res.json(success({ dates, visits, newUsers, operations }))
})

router.get('/system-info', authMiddleware, (req, res) => {
  const uptimeHours = Math.floor(process.uptime() / 3600)
  const uptimeDays = Math.floor(uptimeHours / 24)
  const uptimeStr = uptimeDays > 0
    ? `${uptimeDays}d ${uptimeHours % 24}h`
    : `${uptimeHours}h ${Math.floor((process.uptime() % 3600) / 60)}m`

  res.json(success({
    cpu: Math.floor(Math.random() * 40) + 20,
    memory: Math.floor(Math.random() * 30) + 40,
    disk: Math.floor(Math.random() * 20) + 45,
    uptime: uptimeStr,
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    dbRecords: db.users.length + db.roles.length + db.menus.length + db.departments.length + db.operationLogs.length,
  }))
})

router.get('/activities', authMiddleware, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)
  const logs = [...db.operationLogs]
    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
    .slice(0, limit)
    .map(log => ({
      id: log.id,
      username: log.username,
      action: log.description,
      module: log.module,
      operationType: log.operationType,
      time: log.createdTime,
      status: log.status,
    }))

  res.json(success(logs))
})

export default router
