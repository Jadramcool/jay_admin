import type { Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { mockClientEvents, mockDashboard, mockDepartments, mockDictItems, mockDictTypes, mockMenus, mockNotices, mockRoles, mockSessions, mockSysConfigs, mockTodos, mockUsers, ts } from './data'

/** 统一成功/失败响应(与后端契约一致)。注意:fulfill body 必须为字符串 */
const ok = (data: unknown, message = '操作成功') => ({ code: 200, message, data })
function fail(code: number, message: string, status: number) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ code, message, data: null }),
  }
}

/**
 * 当前登录用户(mock 会话状态,按 worker 隔离)。
 * 默认 admin,保持既有用例行为;普通用户用例在登录时切换。
 */
let currentUserId = 1

function currentUser() {
  return mockUsers.find(u => u.id === currentUserId) ?? mockUsers[0]
}

/** 普通用户可见菜单(无系统管理/审计权限,用于工作台视图用例) */
const normalUserMenuIds = [1, 8, 9, 30]

/** 用户列表过滤 + 分页(对齐后端 paginate 行为) */
function paginateUsers(url: URL) {
  const page = Number(url.searchParams.get('page') || 1)
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') || 20), 100)
  const keyword = url.searchParams.get('keyword')?.trim() || ''
  const username = url.searchParams.get('username')?.trim() || ''
  const status = url.searchParams.get('status')

  let items = mockUsers
  if (keyword)
    items = items.filter(u => u.username.includes(keyword) || u.name.includes(keyword))
  if (username)
    items = items.filter(u => u.username.includes(username))
  if (status !== null && status !== '')
    items = items.filter(u => u.status === Number(status))

  const start = (page - 1) * pageSize
  return ok({
    items: items.slice(start, start + pageSize).map(({ password, ...rest }) => rest),
    total: items.length,
    page,
    pageSize,
  })
}

/**
 * 拦截 /api 请求并返回 mock 数据。
 * 覆盖核心链路:认证、动态菜单、用户管理、公告。
 * 未匹配的请求返回 404,避免误打真实后端。
 *
 * 注意:必须用锚定正则(host 后紧跟 /api/),不能用
 * `**` + `/api/` + `**` 形式的 glob —— 那会误伤
 * Vite 加载的 `src/api/` 源码模块请求。
 */
export async function installApiMocks(page: Page) {
  await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const { pathname } = url
    const method = request.method()

    // ── 认证 ──

    if (pathname === '/api/auth/captcha' && method === 'GET') {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48"><rect width="120" height="48" fill="#f2f5f9"/><text x="12" y="32" font-size="24">1234</text></svg>'
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          enabled: true,
          captchaId: `mock-captcha-${Date.now()}`,
          image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
        })),
      })
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = JSON.parse(request.postData() || '{}') as { username?: string, password?: string }
      const user = mockUsers.find(u => u.username === body.username && u.password === body.password)
      if (!user)
        return route.fulfill(fail(40103, '用户名或密码错误', 401))
      if (user.status === 0)
        return route.fulfill(fail(40302, '账号已被禁用，请联系管理员', 403))
      currentUserId = user.id
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          accessToken: `mock-access-${user.id}`,
          refreshToken: `mock-refresh-${user.id}`,
          expiresIn: 7200,
          tokenType: 'Bearer',
        }, '登录成功')),
      })
    }

    if (pathname === '/api/auth/refresh' && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          accessToken: 'mock-access-refreshed',
          refreshToken: 'mock-refresh-refreshed',
        })),
      })
    }

    if (pathname === '/api/auth/logout' && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '退出成功')) })

    if (pathname === '/api/auth/user/info' && method === 'GET') {
      const user = currentUser()
      const { password, ...info } = user
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(info)) })
    }

    if (pathname === '/api/auth/user/menu' && method === 'GET') {
      const user = currentUser()
      const menus = user.roleType === 'admin' ? mockMenus : mockMenus.filter(m => normalUserMenuIds.includes(m.id))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(menus)) })
    }

    // ── 用户管理 ──
    if (pathname === '/api/system/user/list' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(paginateUsers(url)) })

    if (pathname.startsWith('/api/system/user/detail/') && method === 'GET') {
      const id = Number(pathname.split('/').pop())
      const user = mockUsers.find(u => u.id === id)
      if (!user)
        return route.fulfill(fail(40401, '用户不存在', 404))
      const { password, ...info } = user
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(info)) })
    }

    if (pathname === '/api/system/user/create' && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '创建成功')) })

    if (pathname === '/api/system/user/update' && method === 'PUT')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '更新成功')) })

    // ── 导入导出(Excel) ──
    if (pathname === '/api/system/user/export' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('mock-user-export.xlsx'),
      })
    }

    if (pathname === '/api/system/user/import/template' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('mock-import-template.xlsx'),
      })
    }

    if (pathname === '/api/system/user/import' && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({ total: 2, success: 2, failed: [] }, '导入成功')),
      })
    }

    // ── 待办(内存可变状态) ──
    if (pathname === '/api/todo/list' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok([...mockTodos])) })

    if (pathname === '/api/todo/stats' && method === 'GET') {
      const total = mockTodos.length
      const done = mockTodos.filter(t => t.isDone).length
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ total, undone: total - done, done })) })
    }

    if (pathname === '/api/todo/create' && method === 'POST') {
      const body = JSON.parse(request.postData() || '{}')
      const todo = {
        id: mockTodos.length + 100,
        pid: body.pid ?? null,
        title: body.title,
        content: null,
        sortOrder: mockTodos.length + 1,
        isDone: false,
        doneTime: null,
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString(),
      }
      mockTodos.push(todo)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(todo, '已添加')) })
    }

    if (pathname.startsWith('/api/todo/toggle/') && method === 'PUT') {
      const id = Number(pathname.split('/').pop())
      const todo = mockTodos.find(t => t.id === id)
      if (todo) {
        todo.isDone = !todo.isDone
        todo.doneTime = todo.isDone ? new Date().toISOString() : null
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(todo, '操作成功')) })
    }

    if (pathname.startsWith('/api/todo/delete/') && method === 'DELETE') {
      const id = Number(pathname.split('/').pop())
      mockTodos.splice(mockTodos.findIndex(t => t.id === id), 1)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ id }, '删除成功')) })
    }

    // ── 前端监控 ──
    if (pathname === '/api/metrics/events' && method === 'POST') {
      const body = JSON.parse(request.postData() || '{}')
      const events = body.events || []
      events.forEach((event: any, index: number) => {
        mockClientEvents.push({
          id: 100 + mockClientEvents.length + index,
          type: event.type,
          category: event.category ?? null,
          message: event.message ?? null,
          stack: event.stack ?? null,
          url: event.url ?? null,
          route: event.route ?? null,
          userId: 1,
          browser: 'Chrome 126.0.0.0',
          extra: null,
          createdTime: new Date().toISOString(),
        })
      })
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ received: events.length })) })
    }

    if (pathname === '/api/metrics/events' && method === 'GET') {
      const page = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      const type = url.searchParams.get('type')
      const items = type ? mockClientEvents.filter(e => e.type === type) : mockClientEvents
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          items: [...items].reverse().slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
          total: items.length,
          page,
          pageSize,
        })),
      })
    }

    if (pathname === '/api/metrics/stats' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          total: mockClientEvents.length,
          errors: mockClientEvents.filter(e => e.type === 'error').length,
          pageviews: mockClientEvents.filter(e => e.type === 'pageview').length,
          todayErrors: mockClientEvents.filter(e => e.type === 'error').length,
        })),
      })
    }

    // ── 在线用户 ──
    if (pathname === '/api/system/session/list' && method === 'GET') {
      const page = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      const users = mockUsers
      const items = mockSessions.map((s) => {
        const user = users.find(u => u.id === s.userId)
        return { ...s, username: user?.username ?? '-', userName: user?.name ?? null }
      })
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({ items, total: items.length, page, pageSize })),
      })
    }

    if (pathname === '/api/system/session/stats' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ online: mockSessions.length, total: mockSessions.length })) })

    if (pathname.startsWith('/api/system/session/kick/') && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ kicked: 1 }, '已强制下线')) })

    // ── 系统配置 ──
    if (pathname === '/api/system/config/list' && method === 'GET') {
      const page = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      const keyword = url.searchParams.get('key')?.trim() || ''
      const isPublicParam = url.searchParams.get('isPublic')
      let items = mockSysConfigs
      if (keyword)
        items = items.filter(c => c.key.includes(keyword))
      if (isPublicParam === 'true' || isPublicParam === 'false')
        items = items.filter(c => String(c.isPublic) === isPublicParam)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({ items: items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: items.length, page, pageSize })),
      })
    }

    if (pathname === '/api/system/config/public' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok(mockSysConfigs.filter(c => c.isPublic))),
      })
    }

    if (pathname === '/api/system/config/create' && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '创建成功')) })

    if (pathname === '/api/system/config/update' && method === 'PUT')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '更新成功')) })

    if (pathname.startsWith('/api/system/config/resolve/') && method === 'GET') {
      const key = pathname.split('/').pop()
      const config = mockSysConfigs.find(c => c.key === key)
      let value: unknown = config ? config.value : null
      if (config?.type === 'NUMBER')
        value = Number(value)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(value)) })
    }

    // ── 数据字典 ──
    if (pathname === '/api/system/dict/type/list' && method === 'GET') {
      const page = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      const code = url.searchParams.get('code')?.trim() || ''
      const name = url.searchParams.get('name')?.trim() || ''
      let items = mockDictTypes
      if (code)
        items = items.filter(t => t.code.includes(code))
      if (name)
        items = items.filter(t => t.name.includes(name))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          items: items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
          total: items.length,
          page,
          pageSize,
        })),
      })
    }

    if (pathname === '/api/system/dict/type/create' && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '创建成功')) })

    if (pathname === '/api/system/dict/type/update' && method === 'PUT')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '更新成功')) })

    if (pathname === '/api/system/dict/type/delete/' && method === 'DELETE' && pathname.length > 34)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ id: Number(pathname.split('/').pop()) }, '删除成功')) })

    if (pathname === '/api/system/dict/item/list' && method === 'GET') {
      const typeId = Number(url.searchParams.get('typeId'))
      const items = mockDictItems[typeId] || []
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({ items, total: items.length, page: 1, pageSize: 100 })),
      })
    }

    if (pathname === '/api/system/dict/item/create' && method === 'POST')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(null, '创建成功')) })

    if (pathname.startsWith('/api/system/dict/items/') && method === 'GET') {
      const code = pathname.split('/').pop()
      const type = mockDictTypes.find(t => t.code === code)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok(type ? mockDictItems[type.id] || [] : [])),
      })
    }

    // ── 仪表盘(首页) ──
    if (pathname === '/api/dashboard/stats' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockDashboard.stats)) })
    if (pathname === '/api/dashboard/trends' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockDashboard.trends)) })
    if (pathname === '/api/dashboard/mine' && method === 'GET') {
      const user = currentUser()
      const open = mockTodos.filter(t => !t.isDone)
      const done = mockTodos.length - open.length
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          todo: { openCount: open.length, doneCount: done, recent: open.slice(0, 5) },
          notice: {
            unreadCount: 1,
            recent: mockNotices.slice(0, 5).map((n, i) => ({
              id: i + 1,
              noticeId: n.id,
              title: n.title,
              publishedAt: n.publishedAt,
              type: n.type,
              isPinned: n.isPinned,
              isMandatory: n.isMandatory,
              readTime: i === 0 ? ts(1) : null,
              assignedTime: n.createdTime,
            })),
          },
          myActivities: mockDashboard.activities.filter(a => a.username === user.username),
        })),
      })
    }
    if (pathname === '/api/dashboard/system-info' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockDashboard.systemInfo)) })
    if (pathname === '/api/dashboard/activities' && method === 'GET') {
      // 与后端 C2 分级一致:非审计用户仅返回本人操作记录
      const user = currentUser()
      const items = user.roleType === 'admin' ? mockDashboard.activities : mockDashboard.activities.filter(a => a.username === user.username)
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(items)) })
    }

    // ── 下拉数据 ──
    if (pathname === '/api/system/role/all' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockRoles)) })
    if (pathname === '/api/system/department/tree' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(mockDepartments)) })

    // ── 公告 ──
    if (pathname === '/api/notice/user/unread' && method === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok([])) })

    if (pathname === '/api/notice/list' && method === 'GET') {
      const page = Number(url.searchParams.get('page') || 1)
      const pageSize = Number(url.searchParams.get('pageSize') || 20)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({
          items: mockNotices.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
          total: mockNotices.length,
          page,
          pageSize,
        })),
      })
    }

    if (pathname.startsWith('/api/notice/') && method === 'GET') {
      const id = Number(pathname.split('/').pop())
      const notice = mockNotices.find(n => n.id === id)
      if (!notice)
        return route.fulfill(fail(40401, '公告不存在', 404))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(notice)) })
    }

    // ── 兜底:未覆盖接口返回 404(避免误连真实后端) ──
    return route.fulfill(fail(40401, '请求的资源不存在', 404))
  })
}
