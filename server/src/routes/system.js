import bcrypt from 'bcryptjs'
import { Router } from 'express'
import db from '../data/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { fail, success } from '../utils/response.js'

const router = Router()

// ─── Helpers ───
function paginate(arr, params) {
  let items = [...arr]
  if (params.filters) {
    const f = params.filters
    Object.entries(f).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        items = items.filter(item => String(item[key]).toLowerCase().includes(String(value).toLowerCase()))
      }
    })
  }
  // Sort
  if (params.sorter) {
    const [key, dir] = Object.entries(params.sorter)[0]
    items.sort((a, b) => {
      const va = a[key] ?? ''
      const vb = b[key] ?? ''
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb
      return dir === 'asc' ? cmp : -cmp
    })
  }
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const total = items.length
  if (params.pagination === false) {
    return { list: items, pagination: { page: 1, pageSize: total, total } }
  }
  const start = (page - 1) * pageSize
  const list = items.slice(start, start + pageSize)
  return { list, pagination: { page, pageSize, total } }
}

function addLog(userId, username, type, module, desc, url, status = 'SUCCESS') {
  db.operationLogs.push({
    id: db.logIdSeq++,
    userId,
    username,
    operationType: type,
    module,
    description: desc,
    method: 'POST',
    url,
    status,
    ipAddress: '',
    duration: 0,
    createdTime: new Date().toISOString(),
  })
}

// ═══════════════════════════════════════
//  User Management
// ═══════════════════════════════════════

router.get('/user/list', authMiddleware, (req, res) => {
  const users = db.users.map(({ password, ...u }) => u)
  res.json(success(paginate(users, req.query)))
})

router.get('/user/detail/:id', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === Number(req.params.id))
  if (!user)
    return res.json(fail('用户不存在'))
  const { password, ...info } = user
  res.json(success(info))
})

router.post('/user/create', authMiddleware, (req, res) => {
  const { username, name, password, ...rest } = req.body
  if (!username)
    return res.json(fail('用户名不能为空'))
  if (db.users.some(u => u.username === username))
    return res.json(fail('用户名已存在'))
  const newUser = {
    id: db.users.length + 1,
    username,
    name: name || username,
    password: bcrypt.hashSync(password || '123456', 10),
    phone: rest.phone || '',
    email: rest.email || '',
    sex: rest.sex || 'OTHER',
    avatar: rest.avatar || '',
    status: rest.status ?? 1,
    roleType: rest.roleType || 'user',
    position: rest.position || '',
    departmentId: rest.departmentId || null,
    departmentName: rest.departmentName || '',
    roles: rest.roleIds ? db.roles.filter(r => (rest.roleIds || []).includes(r.id)) : [],
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
  db.users.push(newUser)
  addLog(req.user.id, req.user.username, 'CREATE', '用户管理', `创建了新用户「${newUser.name}」`, '/system/user/create')
  res.json(success(null, '创建成功'))
})

router.put('/user/update', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === Number(req.body.id))
  if (!user)
    return res.json(fail('用户不存在'))
  const { id, password, ...data } = req.body
  Object.assign(user, data, { updatedTime: new Date().toISOString() })
  addLog(req.user.id, req.user.username, 'UPDATE', '用户管理', `修改了用户「${user.name}」的信息`, '/system/user/update')
  res.json(success(null, '更新成功'))
})

router.delete('/user/delete/:id', authMiddleware, (req, res) => {
  const idx = db.users.findIndex(u => u.id === Number(req.params.id))
  if (idx === -1)
    return res.json(fail('用户不存在'))
  const user = db.users[idx]
  db.users.splice(idx, 1)
  addLog(req.user.id, req.user.username, 'DELETE', '用户管理', `删除了用户「${user.name}」`, '/system/user/delete')
  res.json(success(null, '删除成功'))
})

router.post('/user/batch-delete', authMiddleware, (req, res) => {
  const { ids } = req.body
  db.users = db.users.filter(u => !(ids || []).includes(u.id))
  addLog(req.user.id, req.user.username, 'DELETE', '用户管理', `批量删除了 ${ids?.length || 0} 个用户`, '/system/user/batch-delete')
  res.json(success(null, '批量删除成功'))
})

router.post('/user/update-status', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === Number(req.body.id))
  if (!user)
    return res.json(fail('用户不存在'))
  user.status = req.body.status ?? 1
  user.updatedTime = new Date().toISOString()
  res.json(success(null, '状态更新成功'))
})

router.post('/user/assign-roles', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === Number(req.body.id))
  if (!user)
    return res.json(fail('用户不存在'))
  user.roles = db.roles.filter(r => (req.body.roleIds || []).includes(r.id))
  user.updatedTime = new Date().toISOString()
  res.json(success(null, '角色分配成功'))
})

router.post('/user/reset-password', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === Number(req.body.id))
  if (!user)
    return res.json(fail('用户不存在'))
  user.password = bcrypt.hashSync('123456', 10)
  user.updatedTime = new Date().toISOString()
  res.json(success(null, '密码已重置为 123456'))
})

// ═══════════════════════════════════════
//  Role Management
// ═══════════════════════════════════════

router.get('/role/list', authMiddleware, (req, res) => {
  const roles = db.roles.map(r => ({
    ...r,
    _count: { users: db.users.filter(u => u.roles.some(ur => ur.id === r.id)).length, menus: db.menus.filter(m => m.pid !== null && !m.permission).length },
  }))
  res.json(success(paginate(roles, req.query)))
})

router.get('/role/all', authMiddleware, (req, res) => {
  res.json(success(db.roles.map(({ _count, ...r }) => r)))
})

router.get('/role/detail/:id', authMiddleware, (req, res) => {
  const role = db.roles.find(r => r.id === Number(req.params.id))
  if (!role)
    return res.json(fail('角色不存在'))
  res.json(success(role))
})

router.post('/role/create', authMiddleware, (req, res) => {
  const { code, name, description } = req.body
  if (!code || !name)
    return res.json(fail('角色编码和名称不能为空'))
  if (db.roles.some(r => r.code === code))
    return res.json(fail('角色编码已存在'))
  const newRole = {
    id: db.roles.length + 1,
    code,
    name,
    description: description || '',
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
  db.roles.push(newRole)
  addLog(req.user.id, req.user.username, 'CREATE', '角色管理', `创建了新角色「${name}」`, '/system/role/create')
  res.json(success(null, '创建成功'))
})

router.put('/role/update', authMiddleware, (req, res) => {
  const role = db.roles.find(r => r.id === Number(req.body.id))
  if (!role)
    return res.json(fail('角色不存在'))
  const { id, ...data } = req.body
  Object.assign(role, data, { updatedTime: new Date().toISOString() })
  addLog(req.user.id, req.user.username, 'UPDATE', '角色管理', `修改了角色「${role.name}」的信息`, '/system/role/update')
  res.json(success(null, '更新成功'))
})

router.delete('/role/delete/:id', authMiddleware, (req, res) => {
  const idx = db.roles.findIndex(r => r.id === Number(req.params.id))
  if (idx === -1)
    return res.json(fail('角色不存在'))
  db.roles.splice(idx, 1)
  addLog(req.user.id, req.user.username, 'DELETE', '角色管理', `删除了角色「${db.roles[idx]?.name || ''}」`, '/system/role/delete')
  res.json(success(null, '删除成功'))
})

router.post('/role/assign-menu', authMiddleware, (req, res) => {
  addLog(req.user.id, req.user.username, 'UPDATE', '角色管理', '分配了角色菜单权限', '/system/role/assign-menu')
  res.json(success(null, '菜单分配成功'))
})

// ═══════════════════════════════════════
//  Menu Management
// ═══════════════════════════════════════

router.get('/menu/list', authMiddleware, (req, res) => {
  res.json(success(paginate(db.menus, req.query)))
})

router.get('/menu/tree', authMiddleware, (req, res) => {
  function toTree(items, pid = null) {
    return items.filter(m => m.pid === pid).map(m => ({
      ...m,
      children: toTree(items, m.id),
    }))
  }
  res.json(success(toTree(db.menus)))
})

router.post('/menu/create', authMiddleware, (req, res) => {
  const { code, name, ...rest } = req.body
  if (!code || !name)
    return res.json(fail('菜单编码和名称不能为空'))
  const newMenu = {
    id: db.menus.length + 1,
    code,
    name,
    type: 'MENU',
    pid: rest.pid || null,
    path: rest.path || '',
    icon: rest.icon || '',
    component: rest.component || '',
    show: rest.show ?? true,
    enable: rest.enable ?? true,
    order: rest.order || 0,
    permission: rest.permission || '',
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
  db.menus.push(newMenu)
  addLog(req.user.id, req.user.username, 'CREATE', '菜单管理', `新增了菜单「${name}」`, '/system/menu/create')
  res.json(success(null, '创建成功'))
})

router.put('/menu/update', authMiddleware, (req, res) => {
  const menu = db.menus.find(m => m.id === Number(req.body.id))
  if (!menu)
    return res.json(fail('菜单不存在'))
  const { id, ...data } = req.body
  Object.assign(menu, data, { updatedTime: new Date().toISOString() })
  addLog(req.user.id, req.user.username, 'UPDATE', '菜单管理', `修改了菜单「${menu.name}」`, '/system/menu/update')
  res.json(success(null, '更新成功'))
})

router.delete('/menu/delete/:id', authMiddleware, (req, res) => {
  const idx = db.menus.findIndex(m => m.id === Number(req.params.id))
  if (idx === -1)
    return res.json(fail('菜单不存在'))
  db.menus.splice(idx, 1)
  res.json(success(null, '删除成功'))
})

router.post('/menu/batch-delete', authMiddleware, (req, res) => {
  const { ids } = req.body
  db.menus = db.menus.filter(m => !(ids || []).includes(m.id))
  res.json(success(null, '批量删除成功'))
})

router.get('/menu/online-menus', authMiddleware, (req, res) => {
  const menus = db.menus.filter(m => m.type !== 'BUTTON').map(m => ({
    ...m,
    children: [],
  }))
  res.json(success(menus))
})

// ═══════════════════════════════════════
//  Department Management
// ═══════════════════════════════════════

router.get('/department/list', authMiddleware, (req, res) => {
  res.json(success(paginate(db.departments, req.query)))
})

router.get('/department/tree', authMiddleware, (req, res) => {
  function toTree(items, pid = null) {
    return items.filter(m => m.parentId === pid).map(m => ({
      ...m,
      children: toTree(items, m.id),
    }))
  }
  res.json(success(toTree(db.departments)))
})

router.get('/department/detail/:id', authMiddleware, (req, res) => {
  const dept = db.departments.find(d => d.id === Number(req.params.id))
  if (!dept)
    return res.json(fail('部门不存在'))
  res.json(success(dept))
})

router.post('/department/create', authMiddleware, (req, res) => {
  const { name, code, ...rest } = req.body
  if (!name || !code)
    return res.json(fail('部门名称和编码不能为空'))
  const newDept = {
    id: db.departments.length + 1,
    name,
    code,
    description: rest.description || '',
    level: rest.level ?? 0,
    sortOrder: rest.sortOrder || 0,
    status: rest.status ?? 1,
    managerId: rest.managerId || null,
    parentId: rest.parentId || null,
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
  db.departments.push(newDept)
  addLog(req.user.id, req.user.username, 'CREATE', '部门管理', `创建了新部门「${name}」`, '/system/department/create')
  res.json(success(null, '创建成功'))
})

router.put('/department/update', authMiddleware, (req, res) => {
  const dept = db.departments.find(d => d.id === Number(req.body.id))
  if (!dept)
    return res.json(fail('部门不存在'))
  const { id, ...data } = req.body
  Object.assign(dept, data, { updatedTime: new Date().toISOString() })
  addLog(req.user.id, req.user.username, 'UPDATE', '部门管理', `修改了部门「${dept.name}」的信息`, '/system/department/update')
  res.json(success(null, '更新成功'))
})

router.delete('/department/delete/:id', authMiddleware, (req, res) => {
  const idx = db.departments.findIndex(d => d.id === Number(req.params.id))
  if (idx === -1)
    return res.json(fail('部门不存在'))
  db.departments.splice(idx, 1)
  res.json(success(null, '删除成功'))
})

router.post('/department/enable', authMiddleware, (req, res) => {
  const dept = db.departments.find(d => d.id === Number(req.body.id))
  if (!dept)
    return res.json(fail('部门不存在'))
  dept.status = 1
  dept.updatedTime = new Date().toISOString()
  res.json(success(null, '已启用'))
})

router.post('/department/disable', authMiddleware, (req, res) => {
  const dept = db.departments.find(d => d.id === Number(req.body.id))
  if (!dept)
    return res.json(fail('部门不存在'))
  dept.status = 0
  dept.updatedTime = new Date().toISOString()
  res.json(success(null, '已禁用'))
})

router.get('/department/members', authMiddleware, (req, res) => {
  const deptId = Number(req.query.departmentId)
  const members = db.users
    .filter(u => u.departmentId === deptId)
    .map(({ password, ...u }) => u)
  res.json(success(members))
})

// ═══════════════════════════════════════
//  Operation Log Management
// ═══════════════════════════════════════

router.get('/operation-log/list', authMiddleware, (req, res) => {
  const logs = [...db.operationLogs].sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
  res.json(success(paginate(logs, req.query)))
})

router.get('/operation-log/detail/:id', authMiddleware, (req, res) => {
  const log = db.operationLogs.find(l => l.id === Number(req.params.id))
  if (!log)
    return res.json(fail('日志不存在'))
  res.json(success(log))
})

router.get('/operation-log/stats', authMiddleware, (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLogs = db.operationLogs.filter(l => new Date(l.createdTime) >= today)
  res.json(success({ total: db.operationLogs.length, today: todayLogs.length }))
})

router.delete('/operation-log/delete/:id', authMiddleware, (req, res) => {
  const idx = db.operationLogs.findIndex(l => l.id === Number(req.params.id))
  if (idx === -1)
    return res.json(fail('日志不存在'))
  db.operationLogs.splice(idx, 1)
  res.json(success(null, '删除成功'))
})

router.post('/operation-log/batch-delete', authMiddleware, (req, res) => {
  const { ids } = req.body
  db.operationLogs = db.operationLogs.filter(l => !(ids || []).includes(l.id))
  res.json(success(null, '批量删除成功'))
})

router.post('/operation-log/clear-expired', authMiddleware, (req, res) => {
  const days = req.body.days || 90
  const cutoff = new Date(Date.now() - days * 86400000)
  db.operationLogs = db.operationLogs.filter(l => new Date(l.createdTime) >= cutoff)
  res.json(success(null, `已清除 ${days} 天前的日志`))
})

export default router
