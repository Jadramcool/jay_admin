/**
 * E2E mock 数据集 — 结构与后端响应契约保持一致(见 docs/README.md 第 6 节)
 */

export const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', name: '系统管理员', phone: '13800000001', email: 'admin@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'admin', position: '系统管理员', departmentId: 2, departmentName: '技术部', roles: [{ id: 1, code: 'admin', name: '超级管理员', createdTime: '2026-01-01T00:00:00.000Z', updatedTime: '2026-01-01T00:00:00.000Z' }], createdTime: '2026-01-01T00:00:00.000Z', updatedTime: '2026-01-01T00:00:00.000Z' },
  { id: 2, username: 'zhangsan', password: '123456', name: '张三', phone: '13800000002', email: 'zhangsan@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'user', position: '前端开发工程师', departmentId: 5, departmentName: '前端组', roles: [{ id: 2, code: 'user', name: '普通用户', createdTime: '2026-01-01T00:00:00.000Z', updatedTime: '2026-01-01T00:00:00.000Z' }], createdTime: '2026-02-01T00:00:00.000Z', updatedTime: '2026-02-01T00:00:00.000Z' },
  { id: 3, username: 'lisi', password: '123456', name: '李四', phone: '13800000003', email: 'lisi@jdm.com', sex: 'FEMALE', avatar: '', status: 1, roleType: 'user', position: '后端开发工程师', departmentId: 6, departmentName: '后端组', roles: [], createdTime: '2026-02-10T00:00:00.000Z', updatedTime: '2026-02-10T00:00:00.000Z' },
  { id: 4, username: 'wangwu', password: '123456', name: '王五', phone: '13800000004', email: 'wangwu@jdm.com', sex: 'MALE', avatar: '', status: 1, roleType: 'user', position: '产品经理', departmentId: 3, departmentName: '产品部', roles: [], createdTime: '2026-03-01T00:00:00.000Z', updatedTime: '2026-03-01T00:00:00.000Z' },
  { id: 5, username: 'zhaoliu', password: '123456', name: '赵六', phone: '13800000005', email: 'zhaoliu@jdm.com', sex: 'FEMALE', avatar: '', status: 0, roleType: 'user', position: '测试工程师', departmentId: 7, departmentName: '测试组', roles: [], createdTime: '2026-03-15T00:00:00.000Z', updatedTime: '2026-03-15T00:00:00.000Z' },
]

const ts = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

/** 平铺菜单(与后端 /auth/user/menu 返回结构一致,前端 permission store 会转树) */
export const mockMenus = [
  { id: 1, code: 'dashboard', name: '首页', type: 'MENU', pid: null, path: '/home', icon: 'icon-park-outline:home', component: '/src/views/home/index.vue', show: true, enable: true, order: 0, createdTime: ts(90), updatedTime: ts(30) },
  { id: 2, code: 'system', name: '系统管理', type: 'DIRECTORY', pid: null, path: '/system', icon: 'icon-park-outline:setting', show: true, enable: true, order: 1, createdTime: ts(90), updatedTime: ts(30) },
  { id: 3, code: 'system_user', name: '用户管理', type: 'MENU', pid: 2, path: '/system/user', icon: 'icon-park-outline:user', component: '/src/views/system/user/index.vue', show: true, enable: true, order: 0, createdTime: ts(90), updatedTime: ts(30) },
  { id: 4, code: 'role', name: '角色管理', type: 'MENU', pid: 2, path: '/system/role', icon: 'icon-park-outline:permissions', component: '/src/views/system/role/index.vue', show: true, enable: true, order: 1, createdTime: ts(90), updatedTime: ts(30) },
  { id: 5, code: 'menu', name: '菜单管理', type: 'MENU', pid: 2, path: '/system/menu', icon: 'icon-park-outline:menu-fold', component: '/src/views/system/menu/index.vue', show: true, enable: true, order: 2, createdTime: ts(90), updatedTime: ts(30) },
  { id: 6, code: 'department', name: '部门管理', type: 'MENU', pid: 2, path: '/system/department', icon: 'icon-park-outline:tree', component: '/src/views/system/department/index.vue', show: true, enable: true, order: 3, createdTime: ts(90), updatedTime: ts(30) },
  { id: 7, code: 'operation_log', name: '操作日志', type: 'MENU', pid: 2, path: '/system/operation-log', icon: 'icon-park-outline:log', component: '/src/views/system/operation-log/index.vue', show: true, enable: true, order: 4, createdTime: ts(90), updatedTime: ts(30) },
  { id: 10, code: 'dict', name: '数据字典', type: 'MENU', pid: 2, path: '/system/dict', icon: 'icon-park-outline:book', component: '/src/views/system/dict/index.vue', show: true, enable: true, order: 5, createdTime: ts(60), updatedTime: ts(15) },
  { id: 30, code: 'todo', name: '我的待办', type: 'MENU', pid: null, path: '/todo', icon: 'icon-park-outline:checklist', component: '/src/views/todo/index.vue', show: true, enable: true, order: 4, createdTime: ts(60), updatedTime: ts(15) },
  { id: 8, code: 'notice', name: '通知管理', type: 'MENU', pid: null, path: '/notice', icon: 'icon-park-outline:notification', component: '/src/views/notice/notice/index.vue', show: true, enable: true, order: 2, createdTime: ts(60), updatedTime: ts(15) },
  { id: 9, code: 'user_center', name: '个人中心', type: 'MENU', pid: null, path: '/user-center', icon: 'icon-park-outline:edit-one', component: '/src/views/user-center/index.vue', show: true, enable: true, order: 3, createdTime: ts(60), updatedTime: ts(15) },
  { id: 10, code: 'system:user:list', name: '查看用户', type: 'BUTTON', pid: 3, permission: 'system:user:list', show: false, enable: true, order: 0, createdTime: ts(90), updatedTime: ts(30) },
  { id: 11, code: 'system:user:create', name: '创建用户', type: 'BUTTON', pid: 3, permission: 'system:user:create', show: false, enable: true, order: 1, createdTime: ts(90), updatedTime: ts(30) },
  { id: 12, code: 'system:user:edit', name: '编辑用户', type: 'BUTTON', pid: 3, permission: 'system:user:edit', show: false, enable: true, order: 2, createdTime: ts(90), updatedTime: ts(30) },
  { id: 13, code: 'system:user:delete', name: '删除用户', type: 'BUTTON', pid: 3, permission: 'system:user:delete', show: false, enable: true, order: 3, createdTime: ts(90), updatedTime: ts(30) },
  { id: 31, code: 'metrics', name: '前端监控', type: 'MENU', pid: 2, path: '/monitor', icon: 'icon-park-outline:monitor', component: '/src/views/monitor/index.vue', show: true, enable: true, order: 6, createdTime: ts(60), updatedTime: ts(15) },
  { id: 32, code: 'session', name: '在线用户', type: 'MENU', pid: 2, path: '/system/session', icon: 'icon-park-outline:people', component: '/src/views/system/session/index.vue', show: true, enable: true, order: 7, createdTime: ts(60), updatedTime: ts(15) },
  { id: 33, code: 'system:session:kick', name: '强制下线', type: 'BUTTON', pid: 32, permission: 'system:session:kick', show: false, enable: true, order: 0, createdTime: ts(60), updatedTime: ts(15) },
  { id: 20, code: 'system:dict:create', name: '新增', type: 'BUTTON', pid: 10, permission: 'system:dict:create', show: false, enable: true, order: 0, createdTime: ts(60), updatedTime: ts(15) },
  { id: 21, code: 'system:dict:update', name: '编辑', type: 'BUTTON', pid: 10, permission: 'system:dict:update', show: false, enable: true, order: 1, createdTime: ts(60), updatedTime: ts(15) },
  { id: 22, code: 'system:dict:delete', name: '删除', type: 'BUTTON', pid: 10, permission: 'system:dict:delete', show: false, enable: true, order: 2, createdTime: ts(60), updatedTime: ts(15) },
]

export const mockNotices = [
  { id: 1, title: '系统升级维护通知', content: '<p>系统将于本周六 22:00-24:00 进行升级维护</p>', type: 'NOTICE', authorId: 1, authorName: '系统管理员', status: 1, isPinned: true, isMandatory: false, scopeType: 'ALL', scopeTargets: [], publishedAt: ts(2), createdTime: ts(3), updatedTime: ts(2), readCount: 3, unreadCount: 2, totalReceivers: 5 },
  { id: 2, title: '季度团建活动报名', content: '<p>本季度团建活动开始报名</p>', type: 'ACTIVITY', authorId: 1, authorName: '系统管理员', status: 1, isPinned: false, isMandatory: false, scopeType: 'ALL', scopeTargets: [], publishedAt: ts(5), createdTime: ts(6), updatedTime: ts(5), readCount: 1, unreadCount: 4, totalReceivers: 5 },
]

export const mockRoles = [
  { id: 1, code: 'admin', name: '超级管理员', description: '系统超级管理员', createdTime: ts(90), updatedTime: ts(30) },
  { id: 2, code: 'user', name: '普通用户', description: '普通系统用户', createdTime: ts(90), updatedTime: ts(30) },
  { id: 3, code: 'editor', name: '编辑者', description: '内容编辑人员', createdTime: ts(60), updatedTime: ts(20) },
]

export const mockDepartments = [
  { id: 1, name: '总公司', code: 'HQ', description: '公司总部', level: 0, sortOrder: 1, status: 1, parentId: null, createdTime: ts(90), updatedTime: ts(30) },
  { id: 2, name: '技术部', code: 'TECH', description: '技术研发部门', level: 1, sortOrder: 1, status: 1, parentId: 1, createdTime: ts(90), updatedTime: ts(30) },
  { id: 5, name: '前端组', code: 'FE', description: '前端开发组', level: 2, sortOrder: 1, status: 1, parentId: 2, createdTime: ts(60), updatedTime: ts(15) },
]

export const mockDashboard = {
  stats: {
    userCount: 5,
    userTrend: 12.5,
    roleCount: 3,
    menuCount: 12,
    departmentCount: 3,
    logCount: 128,
    logTodayCount: 8,
    onlineCount: 2,
  },
  trends: {
    dates: [ts(6), ts(5), ts(4), ts(3), ts(2), ts(1), ts(0)],
    visits: [120, 135, 110, 150, 160, 140, 180],
    newUsers: [2, 3, 1, 4, 2, 3, 2],
    operations: [15, 22, 18, 25, 20, 28, 24],
  },
  systemInfo: {
    cpu: 23,
    memory: 45,
    disk: 32,
    uptime: '3天2小时',
    version: '1.0.0',
    nodeVersion: 'v24.18.0',
    platform: 'win32',
    dbRecords: 128,
  },
  activities: [
    { id: 1, username: 'admin', action: '登录系统', module: '认证模块', operationType: 'LOGIN', time: ts(0), status: 'SUCCESS' },
    { id: 2, username: 'zhangsan', action: '创建了用户', module: '用户管理', operationType: 'CREATE', time: ts(1), status: 'SUCCESS' },
    { id: 3, username: 'admin', action: '发布了公告', module: '通知管理', operationType: 'UPDATE', time: ts(2), status: 'SUCCESS' },
  ],
}

export const mockDictTypes = [
  { id: 1, code: 'sex', name: '性别', status: 1, remark: '用户性别', itemCount: 3, createdTime: ts(60), updatedTime: ts(15) },
  { id: 2, code: 'notice_type', name: '公告类型', status: 1, remark: '公告类型分类', itemCount: 3, createdTime: ts(60), updatedTime: ts(15) },
  { id: 3, code: 'status', name: '通用状态', status: 1, remark: '通用启停状态', itemCount: 2, createdTime: ts(60), updatedTime: ts(15) },
]

export const mockDictItems = {
  1: [
    { id: 1, typeId: 1, code: 'MALE', label: '男', sortOrder: 1, status: 1, createdTime: ts(60), updatedTime: ts(15) },
    { id: 2, typeId: 1, code: 'FEMALE', label: '女', sortOrder: 2, status: 1, createdTime: ts(60), updatedTime: ts(15) },
    { id: 3, typeId: 1, code: 'OTHER', label: '其他', sortOrder: 3, status: 1, createdTime: ts(60), updatedTime: ts(15) },
  ],
  2: [
    { id: 4, typeId: 2, code: 'NOTICE', label: '通知', sortOrder: 1, status: 1, createdTime: ts(60), updatedTime: ts(15) },
    { id: 5, typeId: 2, code: 'INFO', label: '信息', sortOrder: 2, status: 1, createdTime: ts(60), updatedTime: ts(15) },
  ],
  3: [
    { id: 6, typeId: 3, code: '1', label: '启用', sortOrder: 1, status: 1, createdTime: ts(60), updatedTime: ts(15) },
    { id: 7, typeId: 3, code: '0', label: '禁用', sortOrder: 2, status: 1, createdTime: ts(60), updatedTime: ts(15) },
  ],
}

export const mockTodos = [
  { id: 1, pid: null, title: '完成周报', content: null, sortOrder: 1, isDone: false, doneTime: null, createdTime: ts(2), updatedTime: ts(1) },
  { id: 2, pid: 1, title: '整理数据', content: null, sortOrder: 1, isDone: false, doneTime: null, createdTime: ts(1), updatedTime: ts(1) },
  { id: 3, pid: null, title: '评审新功能', content: null, sortOrder: 2, isDone: true, doneTime: ts(0), createdTime: ts(5), updatedTime: ts(0) },
]

export const mockClientEvents = [
  { id: 1, type: 'error', category: 'JS_ERROR', message: 'Cannot read properties of undefined', stack: 'at fn (app.js:1:1)', url: 'http://localhost:4000/#/home', route: '/home', userId: 1, browser: 'Chrome 126.0.0.0', extra: null, createdTime: ts(0) },
  { id: 2, type: 'pageview', category: 'ROUTE_CHANGE', message: null, stack: null, url: 'http://localhost:4000/#/system/user', route: '/system/user', userId: 1, browser: 'Chrome 126.0.0.0', extra: null, createdTime: ts(1) },
  { id: 3, type: 'error', category: 'VUE_ERROR', message: 'TypeError: xxx is not a function', stack: 'at setup (index.vue:2:2)', url: 'http://localhost:4000/#/notice', route: '/notice', userId: 1, browser: 'Chrome 126.0.0.0', extra: null, createdTime: ts(2) },
]

export const mockSessions = [
  { id: 1, userId: 1, refreshToken: 'rt-1', accessJti: null, ipAddress: '192.168.1.10', userAgent: 'Chrome 126.0.0.0 on Windows', expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(), lastActiveAt: ts(0), createdTime: ts(0) },
  { id: 2, userId: 2, refreshToken: 'rt-2', accessJti: null, ipAddress: '192.168.1.11', userAgent: 'Firefox 128.0 on macOS', expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), lastActiveAt: ts(1), createdTime: ts(1) },
]
