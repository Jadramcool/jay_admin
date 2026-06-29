# Fix List — jdm-admin

> 审计时间: 2026-06-24
> P0: 3 个 | P1: 4 个 | P2: 若干

---

## Pending (待修复)

### [P0-01] 明文密码持久化到 localStorage

- **类型**: 数据泄露
- **位置**: `src/views/login/components/LoginForm.vue:63-68`
- **描述**: "记住密码"功能将 `formData`（含 `username` 和 `password`）直接 `JSON.stringify` 后存入 `localStorage.setItem('REMEMBER_LOGIN', ...)`。明文密码以纯文本形式持久化在浏览器中。
- **影响**: 同源任意 JavaScript（包括第三方脚本、浏览器扩展、XSS 攻击）均可读取 `localStorage.getItem('REMEMBER_LOGIN')` 获取明文密码。用户往往跨站复用密码，泄露范围不限于本系统。结合 P0-02 XSS 漏洞可直接窃取。
- **修复方案**:
  1. **根本修复**: 移除"记住密码"功能，改用 SSO/OAuth
  2. **最小修复**: 仅存储用户名，排除密码字段
  3. **折中方案**: 使用 `crypto.subtle.encrypt` 加密存储（但密钥管理复杂）
- **状态**: 待修复

---

### [P0-02] 存储型 XSS — `v-html` 渲染未消毒公告内容

- **类型**: 安全漏洞 (存储型 XSS)
- **位置**: `src/views/notice/notice/components/NoticeDetailModal.vue:38`
- **描述**: 使用 `v-html="detail.content || '-'"` 渲染公告内容，`detail.content` 来自后端 API 返回的数据。未使用 `DOMPurify` 等库对 HTML 内容进行消毒。攻击者（或恶意管理员）可在公告内容中注入 `<script>` 或 `<img onerror>` 等恶意 HTML/JavaScript。
- **影响**:
  - 每次用户查看公告自动执行恶意脚本
  - 可窃取 `localStorage` 中的 Token 和明文密码（结合 P0-01）
  - 可冒充用户执行任意 API 操作
  - 管理员系统 XSS 影响整个后台
- **修复方案**:
  1. 安装 `dompurify`，使用 `v-html="DOMPurify.sanitize(detail.content || '-')"`
  2. 或改用 `v-text` / `{{ }}` 插值，将 HTML 作为纯文本显示
  3. 后端也应做输出消毒作为纵深防御
- **状态**: 待修复

---

### [P1-01] `authFailing` 标志永久锁死，Token 刷新永久不可用

- **类型**: 功能缺陷 (认证不可恢复)
- **位置**: `src/utils/http/axios.ts:156-168`
- **描述**: `handleAuthFailure()` 在第 159 行设置 `this.authFailing = true`，该标志 **从未被重置**。后续 Token 刷新逻辑（第 122 行）检查 `!this.authFailing` 条件时永远为 `false`，导致所有 Token 刷新请求被跳过。即使重新登录获取了全新有效 Token，一旦某些旧请求触发 401，`authFailing` 仍然为 `true`，用户陷入无限登录循环。
- **影响**: Token 过期 → 刷新失败 → `authFailing = true` → 后续即使有新 Token 也无法正常使用 → 用户无法正常使用系统
- **修复方案**: 在 `handleRefreshToken` 的成功回调中添加 `this.authFailing = false`：
  ```typescript
  this.refreshTokenPromise = axios.post(...)
    .then((res) => {
      this.authFailing = false  // 新增
      const { accessToken, refreshToken: newRefreshToken } = res.data.data
      setToken({ accessToken, refreshToken: newRefreshToken })
      return accessToken
    })
  ```
- **状态**: 待修复

---

### [P1-02] Token 双重存储导致退出不一致

- **类型**: 数据不一致
- **位置**: `src/store/modules/auth.ts:49-51` + `src/utils/token/index.ts:31-32`
- **描述**: AccessToken 在 `localStorage` 中存储了两次:
  - `JDM_TOKEN` 键（通过 `CustomStorage` 在 `token/index.ts`）
  - `auth` 键（通过 Pinia 持久化 `pick: ['token']`）
    退出登录时可能只清理了一个位置，页面重载后 Pinia 从旧 `auth` 恢复 Token，导致"假登录"。
- **影响**: 用户退出后可能被错误地认为仍然登录，或 Token 残留导致安全隐患。
- **修复方案**: 统一 Token 存储位置，仅通过 `@/utils/token` 管理。auth store 不应 `pick: ['token']`，改为从 `getToken()` 读取。
- **状态**: 待修复

---

### [P1-03] Pinia Store 暴露到 `window.__stores`

- **类型**: 信息泄露
- **位置**: `src/main.ts:18`
- **描述**: 开发环境下将 Pinia 实例挂载到 `window.__stores`，所有 store 状态（含用户信息、权限数据等）在浏览器控制台中可通过 `window.__stores.auth` 等路径直接访问。
- **影响**: 攻击者通过 XSS 或浏览器控制台可直接读取和修改所有 store 中的数据，包括 Token、用户信息、权限列表。
- **修复方案**:
  - 移除该全局挂载，或仅在开发环境且非生产构建时挂载
  - 确认 `VITE_DROP_CONSOLE = true` 在生产环境生效
- **状态**: 待修复

---

### [P1-04] `localStorage.clear()` 全域清除风险

- **类型**: 数据丢失
- **位置**: `src/utils/storage/index.ts:33`
- **描述**: `CustomStorage.clear()` 直接调用 `localStorage.clear()`，会清除同源所有应用的 localStorage 数据，包括其他非同项目的应用数据。
- **影响**: 如果未来代码中某处调用了 `storage.clear()`，将灾难性地清除所有同源数据。
- **修复方案**: 改为仅清除当前应用前缀的键值：`Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k))`
- **状态**: 待修复

---

### [P2-*] 其他需关注问题

| 问题                     | 位置                                    | 简述                                        |
| ------------------------ | --------------------------------------- | ------------------------------------------- |
| WebSocket 未强制 WSS     | `composables/useSocket.ts:24-28`        | URL 构造未强制 `wss://`，Token 可能明文传输 |
| `v-auth` 仅为前端隐藏    | `directives/modules/auth.ts`            | 无 API 层二次校验，直接调用 API 可绕过      |
| 错误处理可能泄露后端信息 | `utils/http/error-handler.ts:13-28`     | 后端 `message` 字段直接展示给用户           |
| 路由守卫输出详细错误     | `router/guards/permission-guard.ts:100` | error 对象输出到控制台                      |
| Token 存储键名可猜测     | `env/.env:7`                            | `VITE_APP_TOKEN_KEY = JDM_TOKEN`            |

---

## Fixed (已修复)

（暂无）

---

## 修复优先级

| 优先级 | 编号                       | 估计工作量 |
| ------ | -------------------------- | ---------- |
| 紧急   | P0-01 (明文密码存储)       | 30 分钟    |
| 紧急   | P0-02 (XSS v-html)         | 30 分钟    |
| 高     | P1-01 (authFailing 锁死)   | 10 分钟    |
| 高     | P1-02 (Token 双重存储)     | 30 分钟    |
| 中     | P1-03 (window.\_\_stores)  | 10 分钟    |
| 中     | P1-04 (localStorage.clear) | 15 分钟    |
