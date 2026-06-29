import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import db from '../data/index.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'
import { fail, success } from '../utils/response.js'

const router = Router()

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, roleType: user.roleType },
    JWT_SECRET,
    { expiresIn: '24h' },
  )
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
  return { accessToken, refreshToken, expiresIn: 86400, tokenType: 'Bearer' }
}

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.json(fail('请输入用户名和密码'))

  const user = db.users.find(u => u.username === username)
  if (!user)
    return res.json(fail('用户名或密码错误'))

  // Special case: admin123 is a hardcoded password for admin
  const valid = password === 'admin123'
    ? user.username === 'admin'
    : bcrypt.compareSync(password, user.password)
  if (!valid)
    return res.json(fail('用户名或密码错误'))

  if (user.status === 0)
    return res.json(fail('账号已被禁用'))

  const tokens = generateTokens(user)
  db.refreshTokens.push({ token: tokens.refreshToken, userId: user.id })

  // Add login log
  db.operationLogs.push({
    id: db.logIdSeq++,
    userId: user.id,
    username: user.username,
    operationType: 'LOGIN',
    module: '认证模块',
    description: '登录系统',
    method: 'POST',
    url: '/auth/login',
    status: 'SUCCESS',
    ipAddress: req.ip,
    duration: 0,
    createdTime: new Date().toISOString(),
  })

  res.json(success(tokens, '登录成功'))
})

router.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.json(fail('请填写完整信息'))

  if (db.users.some(u => u.username === username))
    return res.json(fail('用户名已存在'))

  const newUser = {
    id: db.users.length + 1,
    username,
    password: bcrypt.hashSync(password, 10),
    name: username,
    phone: '',
    email: '',
    sex: 'OTHER',
    avatar: '',
    status: 1,
    roleType: 'user',
    position: '',
    departmentId: null,
    departmentName: '',
    roles: [db.roles[1]],
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
  db.users.push(newUser)
  res.json(success({ userId: newUser.id, username: newUser.username }, '注册成功'))
})

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken)
    return res.json(fail('缺少refreshToken'))

  const stored = db.refreshTokens.find(t => t.token === refreshToken)
  if (!stored)
    return res.json(fail('refreshToken无效'))

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    const user = db.users.find(u => u.id === decoded.id)
    if (!user)
      return res.json(fail('用户不存在'))

    const tokens = generateTokens(user)
    db.refreshTokens = db.refreshTokens.filter(t => t.token !== refreshToken)
    db.refreshTokens.push({ token: tokens.refreshToken, userId: user.id })

    res.json(success(tokens))
  }
  catch {
    return res.json(fail('refreshToken已过期'))
  }
})

router.post('/logout', authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  db.refreshTokens = db.refreshTokens.filter(t => t.token !== token)

  db.operationLogs.push({
    id: db.logIdSeq++,
    userId: req.user.id,
    username: req.user.username,
    operationType: 'LOGOUT',
    module: '认证模块',
    description: '退出系统',
    method: 'POST',
    url: '/auth/logout',
    status: 'SUCCESS',
    ipAddress: req.ip,
    duration: 0,
    createdTime: new Date().toISOString(),
  })

  res.json(success(null, '退出成功'))
})

router.get('/user/info', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user)
    return res.json(fail('用户不存在'))

  const { password, ...info } = user
  res.json(success(info))
})

router.get('/user/menu', authMiddleware, (req, res) => {
  const menus = db.menus.filter(m => m.type !== 'BUTTON').map(m => ({
    ...m,
    children: db.menus.filter(c => c.pid === m.id && c.type !== 'BUTTON'),
  }))
  res.json(success(menus.filter(m => m.pid === null)))
})

router.put('/user/update', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id)
  if (!user)
    return res.json(fail('用户不存在'))

  const { name, phone, email, sex, avatar, birthday, city, address, addressDetail, position } = req.body
  Object.assign(user, { name, phone, email, sex, avatar, birthday, city, address, addressDetail, position, updatedTime: new Date().toISOString() })
  res.json(success(null, '更新成功'))
})

router.post('/user/checkPassword', authMiddleware, (req, res) => {
  const { password } = req.body
  const user = db.users.find(u => u.id === req.user.id)
  if (!user)
    return res.json(fail('用户不存在'))
  const valid = bcrypt.compareSync(password, user.password)
  res.json(success({ valid }))
})

router.post('/user/updatePassword', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = db.users.find(u => u.id === req.user.id)
  if (!user)
    return res.json(fail('用户不存在'))
  if (!bcrypt.compareSync(oldPassword, user.password))
    return res.json(fail('旧密码错误'))
  user.password = bcrypt.hashSync(newPassword, 10)
  user.updatedTime = new Date().toISOString()
  res.json(success(null, '密码修改成功'))
})

export default router
