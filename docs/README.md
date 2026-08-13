# JDM Admin 项目文档

> 本文档基于当前前后端实际代码编写（2026-08-08），描述项目结构、前后端对接契约、认证权限、API 端点与已知问题。

## 1. 项目结构

```text
01template/
├── jdm-admin/         Vue 3 + Vite 前端（TypeScript，@antfu/eslint-config）
│   ├── src/
│   │   ├── api/           接口封装（按域分目录，统一经 axios 实例）
│   │   ├── components/    公共组件（Form / Table / Modal 等）
│   │   ├── views/         页面（login / home / system / notice / user-center ...）
│   │   ├── store/         Pinia（auth / user / permission / app / tab）
│   │   ├── router/        路由与守卫（动态路由由后端菜单生成）
│   │   └── utils/http/    axios 封装（解包、错误归一、401 刷新、去重）
│   ├── env/               环境变量（VITE_ 前缀）
│   └── docs/              本文档
└── jdm-nest-server/    NestJS 11 + Prisma 7 + MySQL 后端
    ├── src/modules/       业务模块（auth / system / notice / dashboard / upload / public）
    ├── src/common/        守卫、拦截器、过滤器、装饰器、工具
    └── prisma/            schema 与迁移
```

## 2. 快速开始

### 后端（先起）

```bash
cd jdm-nest-server
# 准备 MySQL 并配置 .env（DATABASE_URL、JWT_SECRET ≥32 字符）
npm run prisma:generate     # 生成 Prisma Client
npm run prisma:migrate -- --name init   # 建表
npm run prisma:seed         # 种子数据（管理员账号由 SEED_ADMIN_PASSWORD 配置）
npm run dev                 # watch 模式，端口 3000
```

### 前端

```bash
cd jdm-admin
pnpm dev                    # Vite 开发服务，端口 4000
```

前端 dev 代理将 `/api`、`/socket.io`（ws）、`/uploads` 转发到 `http://localhost:3000`；生产构建 `VITE_PROXY=false`，走同域部署。

### 验证命令

| 项目 | 命令                          | 说明                                      |
| ---- | ----------------------------- | ----------------------------------------- |
| 前端 | `pnpm typecheck && pnpm lint` | 类型检查 + ESLint（提交 UI 变更前必跑）   |
| 前端 | `pnpm build`                  | 生产构建                                  |
| 前端 | `pnpm test`                   | Vitest 单元测试                           |
| 前端 | `pnpm test:e2e`               | Playwright E2E（默认 API 打桩，无需后端） |
| 前端 | `pnpm test:e2e:ui`            | Playwright UI 模式调试                    |
| 后端 | `npm run test`                | Jest 单元测试（`*.spec.ts`）              |
| 后端 | `npm run test:e2e`            | 端到端测试（`test/`）                     |
| 后端 | `npm run build`               | 编译到 `dist/`                            |
| 后端 | `npm run prisma:studio`       | 数据库可视化管理                          |

## 3. 前后端对接契约

### 3.1 请求约定

- 所有接口以 `/api` 为前缀（后端全局前缀 + 前端 `baseURL=/api`）。
- 认证接口除外，请求头携带 `Authorization: Bearer <accessToken>`。
- 列表查询使用分页参数 `page`（默认 1）、`pageSize`（默认 20，上限 100）。
- 用户列表等支持 `field__eq`、`field__in` 等操作符后缀（后端 `@QueryWithOps` 装饰器）。

### 3.2 统一响应

```text
// 成功
{ "code": 200, "message": "操作成功", "data": { } }
// 错误（HTTP 4xx/5xx）
{ "code": 40103, "message": "用户名或密码错误", "errMsg": "INVALID_CREDENTIALS", "data": null, "timestamp": "...", "path": "/api/auth/login" }
```

前端 axios 拦截器判定 `code === 0 || code === 200` 为成功，其余抛 `ApiError`（区分 business / network / timeout / cancelled）。

### 3.3 分页结构

```json
{ "items": [], "total": 0, "page": 1, "pageSize": 20 }
```

### 3.4 查询参数注意（重要）

后端全局 `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`：**DTO 未声明的查询参数会直接 400**。前端筛选表单会把空字符串也序列化出去，存在以下已知断裂（见第 8 节）：

| 页面     | 前端发送但 DTO 未声明的参数                                           | 影响                     |
| -------- | --------------------------------------------------------------------- | ------------------------ |
| 通知列表 | `authorName`（空串恒发）、`publishedAt`、`createdTime`、`updatedTime` | **必然 400，页面打不开** |
| 用户列表 | `id`、`createdTime`、`updatedTime`（填写时）                          | 填写后 400               |

## 4. 认证与会话

- **双令牌**：accessToken 有效期 2h（`JWT_EXPIRES_IN`），refreshToken 7d（`JWT_REFRESH_EXPIRES_IN`）。
- **存储**：localStorage，键 `JDM_TOKEN` / `JDM_REFRESH_TOKEN`（可用 `VITE_APP_TOKEN_KEY` 覆盖）；支持 `storage` 事件跨标签页同步。
- **刷新**：请求 401 → `TokenRefreshCoordinator` 合并并发 → `POST /auth/refresh`（body 携带 refreshToken）→ 重放原请求；刷新失败清登录态跳 `/login`。
- **登出**：`POST /auth/logout`（body 携带 `refreshToken`，删除对应会话使令牌立即失效）。
- **登录会话**：登录时创建 `user_session`（记录 refreshToken/IP/UA/过期时间）；刷新令牌轮换时同步更新会话；登出/强制下线删除会话，refreshToken 立即失效。
- **强制下线**：`POST /system/session/kick/:id` 删除会话并将 access token 的 `jti` 加入内存黑名单（2 小时内立即失效；内存实现仅单实例有效）。
- **登录验证码**：`GET /auth/captcha`（@Public）返回 `{ enabled, captchaId?, image? }`（svg 图片,5 分钟过期,一次性）；启用时登录必须携带 `captchaId` + `captcha`，错误返回 `42201`。**可通过环境变量 `LOGIN_CAPTCHA_ENABLED=false` 关闭**（本地/测试环境）,关闭后前端自动隐藏验证码输入框。
- **登录限流**：按 用户名+IP 连续失败 5 次锁定 15 分钟（`42901`），登录成功清零；当前为内存实现，**仅单实例部署有效**，多实例需替换 Redis。
- 登录端点：`POST /auth/login`，body `{ username, password, captcha?, captchaId? }`（验证码关闭时可不传）。

## 5. 权限与动态路由

1. 登录后路由守卫并行请求 `/auth/user/info` + `/auth/user/menu`。
2. 后端 `jwt.strategy.ts` 注入 `req.user = { userId, username, roles, permissions }`；`isSystem` 角色自动获得全部权限。
3. 菜单（平铺）→ 前端 `permission` store → `router.addRoute` 动态挂载，组件经 `import.meta.glob('/src/views/**/*.vue')` 按 `component` 字段解析。
4. **双端校验**：后端 `@RequirePermissions('module:action')` + `PermissionsGuard`（任一匹配即放行，OR 语义）；前端 `buttonPermissionKeys` 控制按钮显隐。

## 6. API 端点清单

> 方法 + 路径（均带 `/api` 前缀）。权限列标注 `@Public` 的端点无需登录；其余需 JWT。业务端点默认带 `@RequirePermissions('module:action')`。

### 6.1 认证 `auth`

| 方法 | 路径                        | 说明                                                                                                                 |
| ---- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| POST | `/auth/login`               | 登录，返回令牌对（@Public，需验证码）                                                                                |
| GET  | `/auth/captcha`             | 获取登录验证码，返回 `{ enabled, captchaId?, image? }`（@Public，`LOGIN_CAPTCHA_ENABLED=false` 时 `enabled: false`） |
| POST | `/auth/register`            | 注册，返回 `{ userId, username }`（@Public）                                                                         |
| POST | `/auth/refresh`             | 刷新令牌，body `{ refreshToken }`（@Public）                                                                         |
| POST | `/auth/logout`              | 登出                                                                                                                 |
| GET  | `/auth/user/info`           | 当前用户信息                                                                                                         |
| GET  | `/auth/user/menu`           | 当前用户菜单（平铺）                                                                                                 |
| PUT  | `/auth/user/update`         | 更新个人信息                                                                                                         |
| POST | `/auth/user/checkPassword`  | 校验密码，返回 `{ valid }`                                                                                           |
| POST | `/auth/user/updatePassword` | 修改密码，body `{ oldPassword, newPassword }`                                                                        |

### 6.2 用户管理 `system/user`

| 方法 | 路径                              | 说明                                                                 |
| ---- | --------------------------------- | -------------------------------------------------------------------- |
| GET  | `/system/user/list`               | 分页列表（`@QueryWithOps`，支持 `field__eq/in`）                     |
| GET  | `/system/user/detail/:id`         | 详情                                                                 |
| POST | `/system/user/create`             | 创建                                                                 |
| PUT  | `/system/user/update`             | 更新（body 含 `id`）                                                 |
| PUT  | `/system/user/delete/:id`         | 删除                                                                 |
| PUT  | `/system/user/batchDelete`        | 批量删除，body `{ ids }`                                             |
| PUT  | `/system/user/status/:id`         | 启停，body `{ status: 0/1 }`                                         |
| POST | `/system/user/roles/:id`          | 分配角色，body `{ roleIds }`                                         |
| POST | `/system/user/reset-password/:id` | 重置密码，body `{ newPassword }`                                     |
| GET  | `/system/user/export`             | 导出用户 Excel（支持与列表相同的筛选参数）                           |
| GET  | `/system/user/import/template`    | 下载导入模板 Excel                                                   |
| POST | `/system/user/import`             | 导入用户（multipart 字段 `file`，返回 `{ total, success, failed }`） |

### 6.3 角色管理 `system/role`

| 方法   | 路径                       | 说明                                     |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/system/role/list`        | 分页列表                                 |
| GET    | `/system/role/all`         | 全部角色（下拉用）                       |
| GET    | `/system/role/:id`         | 详情，返回 `{ ..., menus, users }`       |
| POST   | `/system/role/create`      | 创建                                     |
| PUT    | `/system/role/update`      | 更新（body 含 `id`）                     |
| DELETE | `/system/role/delete/:id`  | 删除                                     |
| POST   | `/system/role/update/menu` | 分配菜单权限，body `{ roleId, menuIds }` |

### 6.4 菜单管理 `system/menu`

| 方法   | 路径                       | 说明                     |
| ------ | -------------------------- | ------------------------ |
| GET    | `/system/menu/list`        | 分页列表                 |
| GET    | `/system/menu/tree`        | 菜单树                   |
| GET    | `/system/menu/onlineMenus` | 在线菜单（@Public）      |
| POST   | `/system/menu/create`      | 创建                     |
| PUT    | `/system/menu/update`      | 更新（body 含 `id`）     |
| DELETE | `/system/menu/delete/:id`  | 删除                     |
| DELETE | `/system/menu/batchDelete` | 批量删除，body `{ ids }` |

### 6.5 部门管理 `system/department`

| 方法   | 路径                                                                    | 说明                                                                 |
| ------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/system/department/list`                                               | 分页列表                                                             |
| GET    | `/system/department/tree`                                               | 部门树                                                               |
| GET    | `/system/department/search`                                             | 搜索，query `keyword`                                                |
| GET    | `/system/department/stats`、`/stats/:id`                                | 统计                                                                 |
| GET    | `/system/department/detail/:id`                                         | 详情                                                                 |
| GET    | `/system/department/members`                                            | 部门成员，query `departmentId`（必填）、`includeChildren`、`keyword` |
| POST   | `/system/department/create`                                             | 创建                                                                 |
| PUT    | `/system/department/update/:id`                                         | 更新                                                                 |
| DELETE | `/system/department/delete/:id`                                         | 删除                                                                 |
| POST   | `/system/department/assign-user` / `batch-assign-users` / `assign-role` | 分配用户/角色                                                        |
| DELETE | `/system/department/remove-user` / `remove-role`                        | 移除用户/角色                                                        |
| PUT    | `/system/department/enable/:id` / `disable/:id`                         | 启停                                                                 |

### 6.6 系统配置 `system/config`

| 方法   | 路径                                | 说明                                                                           |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------ |
| GET    | `/system/config/list`               | 分页列表，query 支持 `category`、`type`、`key`、`name`、`isPublic`、`isSystem` |
| GET    | `/system/config/detail/:id`         | 详情                                                                           |
| GET    | `/system/config/key/:key`           | 按键查询                                                                       |
| GET    | `/system/config/category/:category` | 按分类查询                                                                     |
| GET    | `/system/config/public`             | 公开配置（@Public）                                                            |
| POST   | `/system/config/create`             | 创建                                                                           |
| PUT    | `/system/config/update`             | 更新（body 含 `id`）                                                           |
| DELETE | `/system/config/delete/:id`         | 删除                                                                           |
| PUT    | `/system/config/batchDelete`        | 批量删除，body `{ ids }`                                                       |
| PUT    | `/system/config/status/:id`         | 公开/内部切换，body `{ status: 0/1 }`                                          |
| POST   | `/system/config/validate-password`  | 校验默认密码，body `{ password }`                                              |
| GET    | `/system/config/resolve/:key`       | **类型化读取**单个配置（带缓存，NUMBER→number、JSON→object…）                  |
| GET    | `/system/config/resolve`            | 批量类型化读取，query `keys=a,b,c`                                             |

**配置类型系统**:value 按 `type` 校验与解析（NUMBER/BOOLEAN/JSON/ARRAY/EMAIL/URL 等），写入非法值返回 422；`PASSWORD` 类型**不回显明文**（列表显示 `******`，编辑留空表示不修改）。**isSystem 保护**:系统内置配置禁止删除、禁止改 key/type。读取带内存缓存（5 分钟,写后失效）。前端配套 `useConfig(key)` 组合式读取 + `invalidateConfig()`。

**可见性语义**:`isPublic` 决定读取方式——**公开**配置通过无鉴权的 `/system/config/public` 获取（匿名可读，适合登录页站点名、备案号等）；**内部**（非公开）配置必须登录且具备 `system:config:list` 权限才能读取，管理端接口均不对外暴露。

### 6.7 操作日志 `system/operation-log`

| 方法   | 路径                                  | 说明                                     |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/system/operation-log/list`          | 分页列表（非 GET 请求自动写日志）        |
| GET    | `/system/operation-log/detail/:id`    | 详情                                     |
| GET    | `/system/operation-log/stats`         | 统计，返回 `{ total, today }`            |
| DELETE | `/system/operation-log/delete/:id`    | 删除                                     |
| POST   | `/system/operation-log/batch-delete`  | 批量删除，body `{ ids }`                 |
| POST   | `/system/operation-log/clear-expired` | 清理过期日志，body `{ days }`（默认 90） |

### 6.8 公告 `notice`

| 方法 | 路径                    | 说明                                                          |
| ---- | ----------------------- | ------------------------------------------------------------- |
| GET  | `/notice/list`          | 分页列表（含 `readCount` / `unreadCount` / `totalReceivers`） |
| GET  | `/notice/:id`           | 详情                                                          |
| GET  | `/notice/:id/receivers` | 接收人列表，query `readStatus`（read/unread）                 |
| GET  | `/notice/user/unread`   | 当前用户未读公告（用户端，仅需 JWT）                          |
| PUT  | `/notice/user/read/:id` | 标记已读（用户端）                                            |
| POST | `/notice/create`        | 创建                                                          |
| PUT  | `/notice/update`        | 更新（body 含 `id`）                                          |
| PUT  | `/notice/status/:id`    | 发布/下刊切换                                                 |
| PUT  | `/notice/pin/:id`       | 置顶切换                                                      |
| POST | `/notice/resend/:id`    | 重新推送，返回 `{ id, resendCount, message }`                 |
| PUT  | `/notice/delete/:id`    | 删除                                                          |
| PUT  | `/notice/batchDelete`   | 批量删除，body `{ ids }`                                      |

### 6.9 数据字典 `system/dict`

| 方法   | 路径                           | 说明                                                            |
| ------ | ------------------------------ | --------------------------------------------------------------- |
| GET    | `/system/dict/type/list`       | 字典类型分页（query 支持 `code`/`name`/`status`）               |
| GET    | `/system/dict/type/all`        | 全部启用类型（下拉用）                                          |
| POST   | `/system/dict/type/create`     | 创建类型，body `{ code, name, remark? }`                        |
| PUT    | `/system/dict/type/update`     | 更新类型（body 含 `id`）                                        |
| DELETE | `/system/dict/type/delete/:id` | 删除类型（级联软删字典项）                                      |
| PUT    | `/system/dict/type/status/:id` | 启停类型，body `{ status }`                                     |
| GET    | `/system/dict/item/list`       | 字典项分页（query 支持 `typeId`/`typeCode`/`keyword`/`status`） |
| GET    | `/system/dict/items/:code`     | 按类型编码取启用项（前端字典下拉使用）                          |
| POST   | `/system/dict/item/create`     | 创建字典项，body `{ typeId, code, label, sortOrder? }`          |
| PUT    | `/system/dict/item/update`     | 更新字典项（body 含 `id`）                                      |
| DELETE | `/system/dict/item/delete/:id` | 删除字典项                                                      |
| PUT    | `/system/dict/item/status/:id` | 启停字典项，body `{ status }`                                   |

前端配套：`DictApi` 封装、`useDictStore` 缓存 store、`DictSelect` 通用字典下拉组件（`<DictSelect code="sex" v-model:value="...">`）。内置种子字典：`sex` / `notice_type` / `operation_type` / `status`。

### 6.10 待办事项 `todo`（个人数据,仅需 JWT,按用户隔离）

| 方法   | 路径               | 说明                                                                |
| ------ | ------------------ | ------------------------------------------------------------------- |
| GET    | `/todo/list`       | 我的待办（平铺含 `pid`,前端转树;query 支持 `onlyUndone`/`keyword`） |
| GET    | `/todo/stats`      | 统计，返回 `{ total, undone, done }`                                |
| POST   | `/todo/create`     | 创建，body `{ title, content?, pid?, sortOrder? }`                  |
| PUT    | `/todo/update`     | 更新（body 含 `id`）                                                |
| PUT    | `/todo/toggle/:id` | 完成/取消完成（完成时记录 `doneTime`）                              |
| DELETE | `/todo/delete/:id` | 删除（级联子任务）                                                  |

前端配套：`TodoApi` 封装、`/todo` 待办页面（统计卡片 + 树形列表 + 子任务 + 勾选完成）。

### 6.11 前端监控 `metrics`

| 方法 | 路径              | 说明                                                                                                      |
| ---- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| POST | `/metrics/events` | 前端批量上报事件（仅需登录），body `{ events: [{ type, category, message, stack, url, route, extra? }] }` |
| GET  | `/metrics/events` | 事件分页查询（权限 `system:metrics:list`，query 支持 `type`/`category`）                                  |
| GET  | `/metrics/stats`  | 统计（权限 `system:metrics:list`），返回 `{ total, errors, pageviews, todayErrors }`                      |

前端配套：`utils/monitor`（采集 JS 错误 / Promise 拒绝 / Vue 错误 / 路由访问,批量防抖上报,失败走 localStorage 缓冲重试）、`MetricsApi` 封装、`/monitor` 监控页（统计卡片 + 类型筛选 + 事件列表）。

### 6.13 在线用户 `system/session`

| 方法 | 路径                                | 说明                                                                                |
| ---- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| GET  | `/system/session/list`              | 在线会话分页（权限 `system:session:list`，含用户名/姓名/IP/UA/过期时间）            |
| GET  | `/system/session/stats`             | 在线统计（权限 `system:session:list`），返回 `{ online, total }`                    |
| POST | `/system/session/kick/:id`          | 强制下线指定会话（权限 `system:session:kick`，refreshToken 失效 + access 进黑名单） |
| POST | `/system/session/kick-user/:userId` | 强制下线用户全部会话（权限 `system:session:kick`）                                  |

前端配套：`SessionApi` 封装、`/system/session` 在线用户页（在线统计 + 会话列表 + 强制下线）。

### 6.12 其他

| 方法 | 路径                                                            | 说明                                                                                              |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GET  | `/dashboard/stats` / `/trends` / `/system-info` / `/activities` | 仪表盘（trends 参数 `days`，activities 参数 `limit`）                                             |
| POST | `/upload`                                                       | 单文件上传（multipart 字段 `file`），返回 `{ originalName, fileName, path, url, size, mimeType }` |
| POST | `/upload/batch`                                                 | 批量上传（字段 `files`，≤10 个）                                                                  |
| POST | `/public/sort` / `/public/resetSort`                            | 拖拽排序（前端暂未封装）                                                                          |
| GET  | `/health` / `/health/database`                                  | 健康检查（@Public）                                                                               |

## 7. WebSocket（公告实时推送）

- 命名空间 `/notice`（`WEBSOCKET_NAMESPACE`），前端 `useSocket.ts`（socket.io-client，`VITE_WEBSOCKET_URL=/notice`）。
- 握手时通过 `handshake.auth.token` 或 `query.token` 携带 JWT 校验。
- 连接后加入房间 `user:{userId}`，服务端向房间推送 `newNotice` 事件（payload 见 `Api.NoticePushEvent`）。
- dev 代理 `/socket.io`（ws: true）转发到后端 3000。

## 8. 已知问题与注意事项

1. **通知列表在真后端下必然 400**：前端筛选表单恒发 `authorName=`（空串），`QueryNoticeDto` 未声明该字段，`forbidNonWhitelisted` 直接拒绝；日期筛选（`publishedAt`/`createdTime`/`updatedTime`）同样 400。修复方向：DTO 补充字段并在 service 实现过滤，或前端发送前剔除空串参数。
2. **用户列表筛选 400**：`id`、`createdTime`、`updatedTime` 字段不在 `QueryUserDto`，填写后 400（`phone__eq` 等带 `__` 后缀的参数不受影响）。
3. **CORS 全开放**：后端 `app.enableCors()` 无任何限制，生产应按域名收紧。
4. **僵尸端点**：前端 `RoleApi.users`（`GET /system/role/users/:id`）无人调用，后端也无此端点，建议删除前端定义。
5. **上传为本地存储**：文件保存至后端 `uploads/`，经 `/uploads` 静态映射访问（`ali-oss` 依赖已安装但未启用）。

## 9. API 类型生成（OpenAPI → TypeScript）

前端请求参数类型由后端 Swagger 生成，避免手写类型与 DTO 漂移：

```bash
# 后端：导出 OpenAPI JSON 快照（无需启动服务/数据库，脚本已打桩 Prisma 连接）
cd jdm-nest-server
npm run openapi:export          # 输出到 ../jdm-admin/typings/openapi.json

# 前端：由快照生成类型 + 校验
cd jdm-admin
pnpm gen:api                    # typings/openapi.json → typings/openapi.d.ts
pnpm typecheck                  # 契约漂移会在编译期暴露
```

- 已接入：`Api.LoginParams`、`Api.RegisterParams`、`Api.CheckPasswordParams`、`Api.UpdatePasswordParams`、`Api.RefreshTokenParams`、`Api.UserProfileUpdate`、`System.UserCreatePayload`、`System.UserUpdatePayload`（均引用 `components['schemas']['XxxDto']`）。
- 后端修改 DTO 后需重新执行上述两步；`typings/openapi.d.ts` 与 `typings/openapi.json` 为生成物，不手改。
- 当前 OpenAPI 仅覆盖请求 DTO（响应类型无 schema）；待后端补齐 `@ApiOkResponse({ type })` 后可把响应类型也纳入生成。

## 10. E2E 测试（Playwright）

- 覆盖：登录/登出、动态路由守卫、用户列表与筛选、新增用户流程、用户导出/导入、公告列表与详情。
- 默认通过 `page.route` 拦截 `/api` 请求返回 mock 数据（`e2e/mocks/`），**不依赖后端与数据库**；设置 `USE_REAL_API=1` 可走真实后端（需先启动 `jdm-nest-server`）。
- 运行：`pnpm test:e2e`（自动拉起 Vite dev server，串行执行）；`pnpm test:e2e:ui` 交互调试。
- 新增用例时将页面依赖的接口补充到 `e2e/mocks/api.ts`，未覆盖的接口返回 404 兜底，避免误连真实后端。

## 11. 代码生成器（Plop）

```bash
pnpm gen:page <name>     # 如 pnpm gen:page user-group
```

一键生成 CRUD 模块前端骨架（模板见 `plop-templates/`，遵循项目 antfu 风格与既有组件模式）：

- `src/api/<name>/<name>.ts` + `index.ts`：API 封装（列表/创建/更新/删除）
- `src/views/<name>/index.vue`：列表页（`BasicTable` + `FormQuery` + 操作列）
- `src/views/<name>/components/<Pascal>Modal.vue`：新增/编辑弹窗（`BasicModal` + `useModalInner`）
- `e2e/<name>.spec.ts`：基础 E2E 用例

生成后需手动：① 在 `typings/system.d.ts` 补充 `<Pascal>` 接口（响应类型暂未接入 OpenAPI 生成）；② 后端实现对应端点并重新导出 OpenAPI；③ 需要菜单/权限时补充种子数据。

## 12. 历史变更

- **2026-08-08**：移除 `jdm-admin/server/`（Express mock 后端），前端开发直接对接 `jdm-nest-server`；重建本文档；接入 OpenAPI 类型生成（`scripts/export-openapi.ts` + `pnpm gen:api`）；修复用户创建时 `roleIds` 无法提交的契约问题（`CreateUserDto` 补 `roleIds` 并在 `UserService.create` 事务中分配角色）。
- **2026-08-08**：接入 Playwright E2E（`pnpm test:e2e`，API 打桩模式）；顺带修复两个真实前端 bug：用户编辑表单手机号非必填却校验报错（`schema.tsx` 缺空值短路）、新增/编辑用户后返回跳转不存在的 `/system/user/list` 导致 404（`UserEdit.vue`）。
- **2026-08-08**：确认并补全 Excel 导入导出闭环（后端 `exceljs` 端点 + 前端封装/弹窗已存在）；E2E 新增导入导出用例，修复导入弹窗按钮文案未生效的 bug（`UserImportModal.vue` 误用 naive-ui 的 `positive-text`，BasicModal 实际 prop 为 `ok-text`）。
- **2026-08-08**：新增数据字典模块（`dict_type`/`dict_item` 双表 + 迁移 + 种子 + `system/dict` 12 个端点 + 8 项单元测试）；前端新增 `DictApi`、`useDictStore` 缓存 store、`DictSelect` 通用下拉组件与字典管理页（`/system/dict`，含类型 CRUD 与字典项管理弹窗）；E2E 新增 3 个字典用例（共 13 个）。
- **2026-08-08**：新增待办模块（`todo` 6 个端点,数据按用户隔离 + 子任务树 + 级联删除 + 完成时间,6 项单元测试）；前端新增 `TodoApi` 与 `/todo` 待办页（统计卡片 + 树形列表 + 勾选完成）；E2E 新增 2 个待办用例（共 15 个）。
- **2026-08-08**：新增前端错误监控与埋点（`client_event` 表 + 迁移 + `metrics` 3 个端点 + 4 项单元测试）；前端 `utils/monitor` 采集 JS 错误 / Promise 拒绝 / Vue 错误 / 路由访问,批量防抖上报 + localStorage 缓冲重试；`/monitor` 监控页（统计 + 筛选列表）；E2E 新增 2 个监控用例（含注入错误验证上报链路,共 17 个）。
- **2026-08-08**：登录安全增强——图形验证码（`svg-captcha`，`GET /auth/captcha`，5 分钟过期一次性,`LoginGuardService` 9 项测试）+ 登录失败限流（按 用户名+IP 连续 5 次锁定 15 分钟,错误码 `42901`,成功清零;内存实现仅单实例有效）;登录页新增验证码输入与点击刷新;E2E 新增 2 个验证码用例并适配全部登录流程（共 19 个）。
- **2026-08-08**：在线用户/会话管理（`user_session` 表 + 迁移 + `system/session` 4 个端点 + 6 项测试）——登录建会话、刷新轮换、登出删会话、强制下线（refreshToken 失效 + access jti 内存黑名单 2h）;前端 `/system/session` 在线用户页（在线统计 + 列表 + 强制下线）;E2E 新增 2 个用例（共 21 个）。至此 **P1 全部完成**。
- **2026-08-08**：接入 Plop 代码生成器（`pnpm gen:page <name>`，模板见 `plop-templates/`）——一键生成 API 封装 + 列表页 + 弹窗 + E2E 用例骨架，遵循 antfu 风格与既有组件模式。**P2 第 1 项完成**。
- **2026-08-08**：全局水印（`v-watermark` 指令：Canvas 旋转文字平铺 + `pointer-events: none` 不阻塞交互 + MutationObserver 防篡改自动重建）;布局根节点接入,内容为当前用户 + 日期,登录后生效;E2E 新增水印渲染与防篡改用例（共 22 个）。**P2 第 2 项完成**。
- **2026-08-08**：系统配置模块完善（M1+M2）——配置类型系统（parse/validate/serialize,非法值 422）、内存缓存（5 分钟写后失效）、isSystem 保护（禁删禁改 key/type）、PASSWORD 脱敏展示与编辑留空不修改、`resolve` 类型化读取端点、前端 `useConfig`/`invalidateConfig` 与类型化编辑控件;新增 18 项单元测试与 2 个 E2E 用例（共 25 个）。
- **2026-08-13**：系统配置**接入业务生效**——配置查询支持「全部/公开/内部」三态（默认全部,不传即不过滤）,可见性统一命名为「公开/内部」（公开=匿名可读 `@Public`、内部=登录后可读）;登录限流参数改读配置 `security.login.maxRetry`/`security.login.lockMinutes`（写配置即时生效,新增 2 项测试,后端共 134 项）;seed 新增 security 配置并按 key 增量补充（幂等）;登录页品牌位/侧边栏标题/页脚版权读公开配置 `site_name`/`site_description`/`copyright`（前端 `usePublicConfig` + 模块级缓存,mock 同步对齐 key 并补 public 路由）。
- **2026-08-13**：**主题色接入系统配置**——启动时读取公开配置 `primary_color` 应用为主题色（`appStore.setPrimaryColor` 全站生效:naive-ui overrides + CSS 变量 + 菜单/输入框变体色）;新增 `primaryColorSource`（config/manual）区分来源:配置色始终跟随,用户在设置抽屉手动改色后标记 manual 不再被覆盖,重置设置恢复跟随;登录页 logo 硬编码绿色改为 `--primary-color-rgb` 变量;E2E 新增主题色断言（共 26 个）,Playwright 超时放宽至 60s（dev 冷编译可达 20-30s）。
