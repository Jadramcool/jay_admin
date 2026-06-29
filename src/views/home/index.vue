<script setup lang="ts">
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'vue-router'
import { MenuApi } from '@/api/system/menu'
import { OperationLogApi } from '@/api/system/operationLog'
import { RoleApi } from '@/api/system/role'
import { UserManagerApi } from '@/api/system/userManager'
import { useUserStore } from '@/store/modules'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
const isAdmin = computed(() => user.value?.roleType === 'admin')

const stats = ref([
  {
    label: '用户数',
    value: '-',
    icon: 'icon-park-outline:user',
    color: '#18a058',
    bg: 'rgba(24,160,88,0.10)',
  },
  {
    label: '角色数',
    value: '-',
    icon: 'icon-park-outline:permissions',
    color: '#2080f0',
    bg: 'rgba(32,128,240,0.10)',
  },
  {
    label: '菜单数',
    value: '-',
    icon: 'icon-park-outline:menu',
    color: '#f0a020',
    bg: 'rgba(240,160,32,0.10)',
  },
  {
    label: '操作日志',
    value: '-',
    icon: 'icon-park-outline:log',
    color: '#d03050',
    bg: 'rgba(208,48,80,0.10)',
  },
])

const loading = ref(true)
const recentLogs = ref<System.OperationLog[]>([])
const logsLoading = ref(false)

const adminActions = [
  {
    label: '用户管理',
    icon: 'icon-park-outline:user',
    route: '/system/user',
    color: '#18a058',
    desc: '管理系统用户账号',
  },
  {
    label: '角色管理',
    icon: 'icon-park-outline:permissions',
    route: '/system/role',
    color: '#2080f0',
    desc: '配置角色与权限',
  },
  {
    label: '菜单管理',
    icon: 'icon-park-outline:menu-fold',
    route: '/system/menu',
    color: '#f0a020',
    desc: '维护导航与路由',
  },
  {
    label: '部门管理',
    icon: 'icon-park-outline:tree',
    route: '/system/department',
    color: '#7c3aed',
    desc: '组织架构管理',
  },
  {
    label: '操作日志',
    icon: 'icon-park-outline:log',
    route: '/system/operation-log',
    color: '#d03050',
    desc: '审计与安全追溯',
  },
  {
    label: '个人中心',
    icon: 'icon-park-outline:edit-one',
    route: '/user-center',
    color: '#ec4899',
    desc: '编辑个人资料',
  },
]

const userActions = [
  {
    label: '个人中心',
    icon: 'icon-park-outline:edit-one',
    route: '/user-center',
    color: '#18a058',
    desc: '编辑个人资料与头像',
  },
  {
    label: '安全设置',
    icon: 'icon-park-outline:lock-one',
    route: '/user-center',
    color: '#2080f0',
    desc: '修改密码与安全选项',
  },
]

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6)
    return '夜深了'
  if (hour < 9)
    return '早上好'
  if (hour < 12)
    return '上午好'
  if (hour < 14)
    return '中午好'
  if (hour < 18)
    return '下午好'
  return '晚上好'
})

const weekday = computed(() => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${days[dayjs().day()]}`
})

const now = ref(dayjs().format('HH:mm:ss'))
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs().format('HH:mm:ss')
  }, 1000)
  loadDashboardData()
  if (isAdmin.value)
    loadRecentLogs()
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})

async function loadDashboardData() {
  if (!isAdmin.value) {
    loading.value = false
    return
  }
  try {
    const [userRes, roleRes, menuRes] = await Promise.allSettled([
      UserManagerApi.list({ page: 1, pageSize: 1, pagination: true }),
      RoleApi.list({ page: 1, pageSize: 1, pagination: true }),
      MenuApi.list({ page: 1, pageSize: 1, pagination: true }),
    ])
    if (userRes.status === 'fulfilled')
      stats.value[0].value = String(userRes.value.pagination?.total ?? '-')
    if (roleRes.status === 'fulfilled')
      stats.value[1].value = String(roleRes.value.pagination?.total ?? '-')
    if (menuRes.status === 'fulfilled')
      stats.value[2].value = String(menuRes.value.pagination?.total ?? '-')
    try {
      const logStats = await OperationLogApi.stats()
      stats.value[3].value = String((logStats as any)?.total ?? '-')
    }
    catch {
      /* ignore */
    }
  }
  catch {
    /* keep default '-' */
  }
  finally {
    loading.value = false
  }
}

async function loadRecentLogs() {
  logsLoading.value = true
  try {
    const res = await OperationLogApi.list({ page: 1, pageSize: 8 })
    recentLogs.value = res.list ?? []
  }
  catch {
    recentLogs.value = []
  }
  finally {
    logsLoading.value = false
  }
}

function handleNavigate(route: string) {
  router.push(route)
}

function operationTypeColor(type: string): string {
  const map: Record<string, string> = {
    CREATE: '#18a058',
    UPDATE: '#2080f0',
    DELETE: '#d03050',
    LOGIN: '#7c3aed',
    LOGOUT: '#f0a020',
  }
  return map[type] ?? '#909090'
}

function operationTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CREATE: '新增',
    UPDATE: '修改',
    DELETE: '删除',
    LOGIN: '登录',
    LOGOUT: '登出',
    READ: '查询',
    EXPORT: '导出',
    IMPORT: '导入',
  }
  return map[type] ?? type
}

function statusColor(status: string): string {
  return status === 'SUCCESS' ? '#18a058' : '#d03050'
}

function formatTime(time: string): string {
  const d = dayjs(time)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return d.format('HH:mm:ss')
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return `昨天 ${d.format('HH:mm')}`
  if (d.isSame(now, 'year'))
    return d.format('MM-DD HH:mm')
  return d.format('YYYY-MM-DD HH:mm')
}
</script>

<template>
  <div class="db-page">
    <div class="db-page__ambient" aria-hidden="true">
      <div class="db-page__glow db-page__glow--a" />
      <div class="db-page__glow db-page__glow--b" />
      <div class="db-page__grain" />
    </div>

    <div class="db-page__body">
      <!-- Welcome Banner -->
      <div class="db-welcome">
        <div class="db-welcome__content">
          <div class="db-welcome__avatar">
            <n-avatar
              v-if="user?.avatar"
              :src="user.avatar"
              :size="52"
              round
              fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
            />
            <n-avatar v-else :size="52" round>
              {{ user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "?" }}
            </n-avatar>
          </div>
          <div class="db-welcome__text">
            <h2 class="db-welcome__greeting">
              {{ greeting }}，{{ user?.name ?? user?.username }}
            </h2>
            <p class="db-welcome__meta">
              <span class="db-welcome__time">{{ now }}</span>
              <span class="db-welcome__sep">·</span>
              <span>{{ weekday }}</span>
              <span v-if="user?.departmentName" class="db-welcome__sep">·</span>
              <span v-if="user?.departmentName">{{ user.departmentName }}</span>
            </p>
          </div>
        </div>
        <div class="db-welcome__role">
          <n-tag
            v-if="isAdmin"
            type="warning"
            round
            size="small"
            :bordered="false"
          >
            <template #icon>
              <Icon icon="icon-park-outline:badge" />
            </template>
            管理员
          </n-tag>
          <n-tag v-else type="info" round size="small" :bordered="false">
            <template #icon>
              <Icon icon="icon-park-outline:user" />
            </template>
            普通用户
          </n-tag>
        </div>
      </div>

      <!-- ──── Admin Dashboard ──── -->
      <template v-if="isAdmin">
        <!-- Stats Cards -->
        <n-grid cols="1 s:2 m:3 l:4" :x-gap="16" :y-gap="16" class="db-section">
          <n-gi v-for="item in stats" :key="item.label">
            <div
              class="db-stat"
              :style="{ '--stat-color': item.color, '--stat-bg': item.bg }"
            >
              <n-skeleton v-if="loading" text :repeat="2" />
              <template v-else>
                <div class="db-stat__header">
                  <span class="db-stat__label">{{ item.label }}</span>
                  <div class="db-stat__icon">
                    <Icon :icon="item.icon" />
                  </div>
                </div>
                <div class="db-stat__value">
                  <span class="db-stat__number">{{ item.value }}</span>
                </div>
                <div class="db-stat__footer">
                  <span>系统
                    {{
                      item.label === "用户数"
                        ? "注册"
                        : item.label === "角色数"
                          ? "已建"
                          : item.label === "菜单数"
                            ? "已配置"
                            : "累计"
                    }}</span>
                </div>
              </template>
            </div>
          </n-gi>
        </n-grid>

        <!-- Quick Actions + Recent Logs -->
        <n-grid cols="1 l:3" :x-gap="16" :y-gap="16" class="db-section">
          <!-- Quick Actions -->
          <n-gi :span="1">
            <n-card
              title="快捷操作"
              size="small"
              :bordered="false"
              class="db-card"
            >
              <div class="db-actions">
                <div
                  v-for="action in adminActions"
                  :key="action.label"
                  class="db-action"
                  :style="{ '--accent': action.color }"
                  @click="handleNavigate(action.route)"
                >
                  <div class="db-action__icon">
                    <Icon :icon="action.icon" />
                  </div>
                  <div class="db-action__info">
                    <span class="db-action__label">{{ action.label }}</span>
                    <span class="db-action__desc">{{ action.desc }}</span>
                  </div>
                  在·
                </div>
              </div>
            </n-card>
          </n-gi>

          <!-- Recent Operation Logs -->
          <n-gi :span="2">
            <n-card
              title="最近操作日志"
              size="small"
              :bordered="false"
              class="db-card"
            >
              <template #header-extra>
                <n-button
                  text
                  size="tiny"
                  @click="handleNavigate('/system/operation-log')"
                >
                  查看全部
                  <template #icon>
                    <Icon icon="icon-park-outline:right" />
                  </template>
                </n-button>
              </template>

              <n-skeleton v-if="logsLoading" :repeat="5" text />

              <n-thing v-else-if="recentLogs.length === 0" class="db-empty">
                <template #description>
                  暂无操作日志
                </template>
              </n-thing>

              <div v-else class="db-logs">
                <div
                  v-for="log in recentLogs"
                  :key="log.id"
                  class="db-log"
                  @click="handleNavigate('/system/operation-log')"
                >
                  <div
                    class="db-log__dot"
                    :style="{ background: statusColor(log.status) }"
                  />
                  <div class="db-log__body">
                    <div class="db-log__top">
                      <span class="db-log__user">{{ log.username }}</span>
                      <n-tag
                        :color="{
                          textColor: '#fff',
                          borderColor: operationTypeColor(log.operationType),
                          color: operationTypeColor(log.operationType),
                        }"
                        size="tiny"
                        :bordered="false"
                        round
                      >
                        {{ operationTypeLabel(log.operationType) }}
                      </n-tag>
                      <span v-if="log.module" class="db-log__module">{{
                        log.module
                      }}</span>
                    </div>
                    <div class="db-log__bottom">
                      <span class="db-log__desc">{{
                        log.description || log.url || "-"
                      }}</span>
                      <span class="db-log__time">{{
                        formatTime(log.createdTime)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </template>

      <!-- ──── User Dashboard ──── -->
      <template v-else>
        <n-grid cols="1 l:3" :x-gap="16" :y-gap="16" class="db-section">
          <!-- User Profile Card -->
          <n-gi :span="1">
            <n-card
              size="small"
              :bordered="false"
              class="db-card db-card--profile"
            >
              <div class="db-profile">
                <n-avatar
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :size="72"
                  round
                  fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
                />
                <n-avatar v-else :size="72" round>
                  {{
                    user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "?"
                  }}
                </n-avatar>
                <div class="db-profile__info">
                  <h3 class="db-profile__name">
                    {{ user?.name ?? user?.username }}
                  </h3>
                  <p class="db-profile__username">
                    @{{ user?.username }}
                  </p>
                </div>
                <n-descriptions
                  :column="1"
                  label-placement="left"
                  label-width="80px"
                  size="small"
                  class="db-profile__detail"
                >
                  <n-descriptions-item v-if="user?.email" label="邮箱">
                    {{ user.email }}
                  </n-descriptions-item>
                  <n-descriptions-item v-if="user?.phone" label="手机号">
                    {{ user.phone }}
                  </n-descriptions-item>
                  <n-descriptions-item v-if="user?.departmentName" label="部门">
                    {{ user.departmentName }}
                  </n-descriptions-item>
                  <n-descriptions-item label="角色">
                    <span v-for="(role, i) in user?.roles" :key="role.id">
                      {{ role.name
                      }}<span v-if="i < (user?.roles?.length ?? 0) - 1">,
                      </span>
                    </span>
                  </n-descriptions-item>
                  <n-descriptions-item label="状态">
                    <n-tag
                      :type="user?.status === 1 ? 'success' : 'error'"
                      size="tiny"
                      round
                      :bordered="false"
                    >
                      {{ user?.status === 1 ? "启用" : "禁用" }}
                    </n-tag>
                  </n-descriptions-item>
                </n-descriptions>
              </div>
            </n-card>
          </n-gi>

          <!-- Quick Actions -->
          <n-gi :span="2">
            <n-card
              title="快捷操作"
              size="small"
              :bordered="false"
              class="db-card"
            >
              <div class="db-actions db-actions--user">
                <div
                  v-for="action in userActions"
                  :key="action.label"
                  class="db-action"
                  :style="{ '--accent': action.color }"
                  @click="handleNavigate(action.route)"
                >
                  <div class="db-action__icon">
                    <Icon :icon="action.icon" />
                  </div>
                  <div class="db-action__info">
                    <span class="db-action__label">{{ action.label }}</span>
                    <span class="db-action__desc">{{ action.desc }}</span>
                  </div>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.db-page {
  position: relative;
  margin: -14px;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(24, 160, 88, 0.06), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(32, 128, 240, 0.05), transparent),
    color-mix(in srgb, var(--card-color) 35%, var(--body-color, #f4f5f7));
}

html.dark .db-page {
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(24, 160, 88, 0.08), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(32, 128, 240, 0.06), transparent),
    color-mix(in srgb, var(--card-color) 25%, rgb(20, 20, 24));
}

.db-page__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.db-page__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;

  &--a {
    width: 380px;
    height: 380px;
    top: -150px;
    right: -80px;
    background: rgba(24, 160, 88, 0.15);
  }

  &--b {
    width: 280px;
    height: 280px;
    bottom: -90px;
    left: -50px;
    background: rgba(32, 128, 240, 0.12);
  }
}

.db-page__grain {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
  mix-blend-mode: overlay;
}

html.dark .db-page__grain {
  opacity: 0.18;
  mix-blend-mode: soft-light;
}

.db-page__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px 20px;
  min-height: 100%;
}

.db-section {
  margin: 0 !important;
}

/* ──── Welcome Banner ──── */
.db-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-radius: calc(var(--border-radius) + 4px);
  background:
    linear-gradient(135deg, rgba(24, 160, 88, 0.08) 0%, rgba(32, 128, 240, 0.05) 100%),
    color-mix(in srgb, var(--card-color) 80%, transparent);
  border: 1px solid rgba(24, 160, 88, 0.12);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

html.dark .db-welcome {
  background:
    linear-gradient(135deg, rgba(24, 160, 88, 0.12) 0%, rgba(32, 128, 240, 0.08) 100%),
    color-mix(in srgb, rgb(28, 28, 32) 80%, transparent);
  border-color: rgba(24, 160, 88, 0.15);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.db-welcome__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.db-welcome__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.db-welcome__greeting {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color-1);
  line-height: 1.3;
}

.db-welcome__meta {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.db-welcome__sep {
  color: var(--divider-color);
}

.db-welcome__time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--text-color-2);
}

.db-welcome__role {
  flex-shrink: 0;
}

/* ──── Stat Cards ──── */
.db-stat {
  padding: 18px 20px;
  border-radius: var(--border-radius);
  background:
    linear-gradient(135deg, var(--stat-bg) 0%, transparent 100%), color-mix(in srgb, var(--card-color) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--stat-color) 12%, transparent);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--stat-color) 8%, transparent);
    border-color: color-mix(in srgb, var(--stat-color) 20%, transparent);
  }
}

.db-stat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.db-stat__label {
  font-size: 13px;
  color: var(--text-color-3);
  font-weight: 500;
}

.db-stat__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--stat-bg);
  color: var(--stat-color);
  font-size: 18px;
}

.db-stat__value {
  margin-bottom: 8px;
}

.db-stat__number {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-color-1);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.db-stat__footer {
  font-size: 12px;
  color: var(--text-color-4);
}

/* ──── Card ──── */
.db-card {
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  :deep(.n-card-header) {
    padding: 14px 18px !important;
  }

  :deep(.n-card-header__title) {
    font-size: 14px !important;
    font-weight: 700 !important;
  }

  :deep(.n-card__content) {
    padding: 0 18px 14px !important;
  }
}

.db-card--profile {
  :deep(.n-card__content) {
    padding: 0 0 14px !important;
  }
}

/* ──── Quick Actions ──── */
.db-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.db-actions--user {
  grid-template-columns: 1fr 1fr;
}

.db-action {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--border-radius);
  cursor: pointer;
  background: color-mix(in srgb, var(--card-color) 70%, transparent);
  border: 1px solid transparent;
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--accent) 6%, var(--card-color));
    border-color: color-mix(in srgb, var(--accent) 15%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 6%, transparent);
  }

  &:active {
    transform: translateY(0);
  }
}

.db-action__icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  font-size: 20px;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    background 0.25s ease;
}

.db-action:hover .db-action__icon {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}

.db-action__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.db-action__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
  line-height: 1.3;
}

.db-action__desc {
  font-size: 11.5px;
  color: var(--text-color-4);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ──── Recent Logs ──── */
.db-logs {
  display: flex;
  flex-direction: column;
}

.db-log {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--divider-color);
  transition: background 0.2s ease;
  margin: 0 -6px;
  padding: 10px 6px;
  border-radius: 6px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--hover-color);
  }
}

.db-log__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.db-log__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.db-log__top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.db-log__user {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}

.db-log__module {
  font-size: 12px;
  color: var(--text-color-3);
  background: var(--hover-color);
  padding: 0 6px;
  border-radius: 4px;
  line-height: 1.6;
}

.db-log__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.db-log__desc {
  font-size: 12.5px;
  color: var(--text-color-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.db-log__time {
  font-size: 11.5px;
  color: var(--text-color-4);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* ──── Profile Card (User) ──── */
.db-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  text-align: center;
}

.db-profile__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.db-profile__name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color-1);
}

.db-profile__username {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-4);
}

.db-profile__detail {
  width: 100%;
  text-align: left;
  margin-top: 8px;
}

/* ──── Empty state ──── */
.db-empty {
  :deep(.n-thing-description) {
    text-align: center;
    padding: 20px 0;
    color: var(--text-color-4);
    font-size: 13px;
  }
}

/* ──── Responsive ──── */
@media (max-width: 768px) {
  .db-page__body {
    padding: 12px 12px 16px;
    gap: 12px;
  }

  .db-welcome {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .db-welcome__role {
    align-self: flex-start;
  }

  .db-actions,
  .db-actions--user {
    grid-template-columns: 1fr;
  }

  .db-stat__number {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .db-page * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
