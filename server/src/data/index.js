import bcrypt from 'bcryptjs'

const db = {
  users: [],
  roles: [],
  menus: [],
  departments: [],
  operationLogs: [],
  notices: [],
  refreshTokens: [],
  logIdSeq: 1,
}

function daysAgo(n) {
  const d = new Date(Date.now() - n * 86400000)
  return d.toISOString()
}

function hoursAgo(n) {
  const d = new Date(Date.now() - n * 3600000)
  return d.toISOString()
}

function init() {
  // ── Roles ──
  db.roles = [
    { id: 1, code: 'admin', name: '超级管理员', description: '系统超级管理员', createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 2, code: 'user', name: '普通用户', description: '普通系统用户', createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 3, code: 'editor', name: '编辑者', description: '内容编辑人员', createdTime: daysAgo(60), updatedTime: daysAgo(20) },
    { id: 4, code: 'auditor', name: '审计员', description: '系统审计人员', createdTime: daysAgo(45), updatedTime: daysAgo(10) },
    { id: 5, code: 'manager', name: '部门经理', description: '部门管理人员', createdTime: daysAgo(30), updatedTime: daysAgo(5) },
  ]

  // ── Departments ──
  db.departments = [
    { id: 1, name: '总公司', code: 'HQ', description: '公司总部', level: 0, sortOrder: 1, status: 1, parentId: null, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 2, name: '技术部', code: 'TECH', description: '技术研发部门', level: 1, sortOrder: 1, status: 1, parentId: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 3, name: '产品部', code: 'PM', description: '产品设计部门', level: 1, sortOrder: 2, status: 1, parentId: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 4, name: '市场部', code: 'MKT', description: '市场营销部门', level: 1, sortOrder: 3, status: 1, parentId: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 5, name: '前端组', code: 'FE', description: '前端开发组', level: 2, sortOrder: 1, status: 1, parentId: 2, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 6, name: '后端组', code: 'BE', description: '后端开发组', level: 2, sortOrder: 2, status: 1, parentId: 2, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 7, name: '测试组', code: 'QA', description: '质量测试组', level: 2, sortOrder: 3, status: 1, parentId: 2, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 8, name: '设计组', code: 'DESIGN', description: 'UI/UX设计组', level: 2, sortOrder: 1, status: 0, parentId: 3, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 9, name: '运营组', code: 'OP', description: '运营推广组', level: 2, sortOrder: 1, status: 1, parentId: 4, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 10, name: '人事部', code: 'HR', description: '人力资源部门', level: 1, sortOrder: 4, status: 1, parentId: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
  ]

  // ── Menus ──
  db.menus = [
    { id: 1, code: 'dashboard', name: '首页', type: 'MENU', pid: null, path: '/home', icon: 'icon-park-outline:home', component: '/src/views/home/index.vue', show: true, enable: true, order: 0, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 2, code: 'system', name: '系统管理', type: 'DIRECTORY', pid: null, path: '/system', icon: 'icon-park-outline:setting', show: true, enable: true, order: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 3, code: 'system_user', name: '用户管理', type: 'MENU', pid: 2, path: '/system/user', icon: 'icon-park-outline:user', component: '/src/views/system/user/index.vue', show: true, enable: true, order: 0, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 4, code: 'role', name: '角色管理', type: 'MENU', pid: 2, path: '/system/role', icon: 'icon-park-outline:permissions', component: '/src/views/system/role/index.vue', show: true, enable: true, order: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 5, code: 'menu', name: '菜单管理', type: 'MENU', pid: 2, path: '/system/menu', icon: 'icon-park-outline:menu-fold', component: '/src/views/system/menu/index.vue', show: true, enable: true, order: 2, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 6, code: 'department', name: '部门管理', type: 'MENU', pid: 2, path: '/system/department', icon: 'icon-park-outline:tree', component: '/src/views/system/department/index.vue', show: true, enable: true, order: 3, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 7, code: 'operation_log', name: '操作日志', type: 'MENU', pid: 2, path: '/system/operation-log', icon: 'icon-park-outline:log', component: '/src/views/system/operation-log/index.vue', show: true, enable: true, order: 4, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 8, code: 'notice', name: '通知管理', type: 'MENU', pid: null, path: '/notice', icon: 'icon-park-outline:notification', component: '/src/views/notice/notice/index.vue', show: true, enable: true, order: 2, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    { id: 9, code: 'user_center', name: '个人中心', type: 'MENU', pid: null, path: '/user-center', icon: 'icon-park-outline:edit-one', component: '/src/views/user-center/index.vue', show: true, enable: true, order: 3, createdTime: daysAgo(60), updatedTime: daysAgo(15) },
    // Button permissions
    { id: 10, code: 'system:user:create', name: '创建用户', type: 'BUTTON', pid: 3, permission: 'system:user:create', show: false, enable: true, order: 0, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 11, code: 'system:user:edit', name: '编辑用户', type: 'BUTTON', pid: 3, permission: 'system:user:edit', show: false, enable: true, order: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 12, code: 'system:user:delete', name: '删除用户', type: 'BUTTON', pid: 3, permission: 'system:user:delete', show: false, enable: true, order: 2, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 13, code: 'system:role:create', name: '创建角色', type: 'BUTTON', pid: 4, permission: 'system:role:create', show: false, enable: true, order: 0, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 14, code: 'system:role:edit', name: '编辑角色', type: 'BUTTON', pid: 4, permission: 'system:role:edit', show: false, enable: true, order: 1, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 15, code: 'system:role:delete', name: '删除角色', type: 'BUTTON', pid: 4, permission: 'system:role:delete', show: false, enable: true, order: 2, createdTime: daysAgo(90), updatedTime: daysAgo(30) },
  ]

  // ── Users ──
  db.users = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), name: '系统管理员', phone: '13800000001', email: 'admin@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'admin', position: '系统管理员', departmentId: 2, departmentName: '技术部', roles: [db.roles[0], db.roles[1]], createdTime: daysAgo(90), updatedTime: daysAgo(30) },
    { id: 2, username: 'zhangsan', password: bcrypt.hashSync('123456', 10), name: '张三', phone: '13800000002', email: 'zhangsan@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'user', position: '前端开发工程师', departmentId: 5, departmentName: '前端组', roles: [db.roles[1]], createdTime: daysAgo(80), updatedTime: daysAgo(20) },
    { id: 3, username: 'lisi', password: bcrypt.hashSync('123456', 10), name: '李四', phone: '13800000003', email: 'lisi@jdm.com', sex: 'FEMALE', avatar: '', status: 1, roleType: 'user', position: '后端开发工程师', departmentId: 6, departmentName: '后端组', roles: [db.roles[1]], createdTime: daysAgo(75), updatedTime: daysAgo(15) },
    { id: 4, username: 'wangwu', password: bcrypt.hashSync('123456', 10), name: '王五', phone: '13800000004', email: 'wangwu@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'user', position: '产品经理', departmentId: 3, departmentName: '产品部', roles: [db.roles[2]], createdTime: daysAgo(70), updatedTime: daysAgo(10) },
    { id: 5, username: 'zhaoliu', password: bcrypt.hashSync('123456', 10), name: '赵六', phone: '13800000005', email: 'zhaoliu@jdm.com', sex: 'FEMALE', avatar: '', status: 0, roleType: 'user', position: '测试工程师', departmentId: 7, departmentName: '测试组', roles: [db.roles[1]], createdTime: daysAgo(65), updatedTime: daysAgo(8) },
    { id: 6, username: 'sunqi', password: bcrypt.hashSync('123456', 10), name: '孙七', phone: '13800000006', email: 'sunqi@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'editor', position: '内容编辑', departmentId: 9, departmentName: '运营组', roles: [db.roles[2]], createdTime: daysAgo(50), updatedTime: daysAgo(5) },
    { id: 7, username: 'zhouba', password: bcrypt.hashSync('123456', 10), name: '周八', phone: '13800000007', email: 'zhouba@jdm.com', sex: 'FEMALE', avatar: '', status: 1, roleType: 'auditor', position: '审计专员', departmentId: 10, departmentName: '人事部', roles: [db.roles[3]], createdTime: daysAgo(40), updatedTime: daysAgo(3) },
    { id: 8, username: 'wujiu', password: bcrypt.hashSync('123456', 10), name: '吴九', phone: '13800000008', email: 'wujiu@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'manager', position: '技术部经理', departmentId: 2, departmentName: '技术部', roles: [db.roles[4]], createdTime: daysAgo(30), updatedTime: daysAgo(2) },
  ]

  // ── Operation Logs ──
  const actions = [
    { username: 'admin', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'CREATE', module: '用户管理', desc: '创建了新用户「张三」', url: '/system/user/create', status: 'SUCCESS' },
    { username: 'zhangsan', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'UPDATE', module: '角色管理', desc: '修改了角色「编辑者」的权限', url: '/system/role/update', status: 'SUCCESS' },
    { username: 'admin', type: 'DELETE', module: '用户管理', desc: '删除了用户「test_user」', url: '/system/user/delete', status: 'SUCCESS' },
    { username: 'lisi', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'CREATE', module: '菜单管理', desc: '新增了菜单「通知管理」', url: '/system/menu/create', status: 'SUCCESS' },
    { username: 'wangwu', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'FAILED' },
    { username: 'zhaoliu', type: 'LOGOUT', module: '认证模块', desc: '退出系统', url: '/auth/logout', status: 'SUCCESS' },
    { username: 'admin', type: 'UPDATE', module: '部门管理', desc: '修改了部门「测试组」的信息', url: '/system/department/update', status: 'SUCCESS' },
    { username: 'sunqi', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'EXPORT', module: '操作日志', desc: '导出操作日志报表', url: '/system/operation-log/export', status: 'SUCCESS' },
    { username: 'zhouba', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'CREATE', module: '部门管理', desc: '创建了新部门「运营组」', url: '/system/department/create', status: 'SUCCESS' },
    { username: 'wujiu', type: 'LOGIN', module: '认证模块', desc: '登录系统', url: '/auth/login', status: 'SUCCESS' },
    { username: 'admin', type: 'UPDATE', module: '用户管理', desc: '修改了用户「赵六」的信息', url: '/system/user/update', status: 'SUCCESS' },
    { username: 'zhangsan', type: 'LOGOUT', module: '认证模块', desc: '退出系统', url: '/auth/logout', status: 'SUCCESS' },
    { username: 'admin', type: 'CREATE', module: '角色管理', desc: '创建了新角色「审计员」', url: '/system/role/create', status: 'SUCCESS' },
    { username: 'lisi', type: 'UPDATE', module: '个人中心', desc: '修改了个人密码', url: '/auth/user/updatePassword', status: 'SUCCESS' },
    { username: 'admin', type: 'READ', module: '操作日志', desc: '查询了操作日志列表', url: '/system/operation-log/list', status: 'SUCCESS' },
  ]

  const logTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'READ', 'EXPORT', 'IMPORT']
  const modules = ['用户管理', '角色管理', '菜单管理', '部门管理', '操作日志', '认证模块', '个人中心', '通知管理']
  const usernames = ['admin', 'zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'sunqi', 'zhouba', 'wujiu']

  for (let i = 0; i < 200; i++) {
    const t = logTypes[Math.floor(Math.random() * logTypes.length)]
    const m = modules[Math.floor(Math.random() * modules.length)]
    const u = usernames[Math.floor(Math.random() * usernames.length)]
    const s = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED'
    db.operationLogs.push({
      id: i + 1,
      userId: db.users.find(x => x.username === u)?.id ?? 1,
      username: u,
      operationType: t,
      module: m,
      description: `${t === 'LOGIN' ? '登录' : t === 'LOGOUT' ? '退出' : t === 'CREATE' ? '创建' : t === 'UPDATE' ? '修改' : t === 'DELETE' ? '删除' : '操作'}了${m}`,
      method: 'POST',
      url: `/api/system/${t === 'LOGIN' ? 'auth/login' : m}/${t.toLowerCase()}`,
      status: s,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      duration: Math.floor(Math.random() * 500),
      createdTime: hoursAgo(Math.floor(Math.random() * 720)),
    })
  }

  db.logIdSeq = db.operationLogs.length + 1
}

init()

export default db
