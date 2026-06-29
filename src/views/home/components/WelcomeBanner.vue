<script setup lang="ts">
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules'

const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
const isAdmin = computed(() => user.value?.roleType === 'admin')

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
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-banner__content">
      <div class="welcome-banner__avatar">
        <n-avatar
          v-if="user?.avatar"
          :src="user.avatar"
          :size="52"
          round
          fallback-src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
        />
        <n-avatar v-else :size="52" round>
          {{ user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? '?' }}
        </n-avatar>
      </div>
      <div class="welcome-banner__text">
        <h2 class="welcome-banner__greeting">
          {{ greeting }}，{{ user?.name ?? user?.username }}
        </h2>
        <p class="welcome-banner__meta">
          <span class="welcome-banner__time">{{ now }}</span>
          <span class="welcome-banner__sep">·</span>
          <span>{{ weekday }}</span>
          <span v-if="user?.departmentName" class="welcome-banner__sep">·</span>
          <span v-if="user?.departmentName">{{ user.departmentName }}</span>
        </p>
      </div>
    </div>
    <div class="welcome-banner__badges">
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
      <n-tag v-if="user?.position" type="success" round size="small" :bordered="false">
        <template #icon>
          <Icon icon="icon-park-outline:briefcase" />
        </template>
        {{ user.position }}
      </n-tag>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.welcome-banner {
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

html.dark .welcome-banner {
  background:
    linear-gradient(135deg, rgba(24, 160, 88, 0.12) 0%, rgba(32, 128, 240, 0.08) 100%),
    color-mix(in srgb, rgb(28, 28, 32) 80%, transparent);
  border-color: rgba(24, 160, 88, 0.15);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.welcome-banner__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-banner__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.welcome-banner__greeting {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color-1);
  line-height: 1.3;
}

.welcome-banner__meta {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.welcome-banner__sep {
  color: var(--divider-color);
}

.welcome-banner__time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--text-color-2);
}

.welcome-banner__badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .welcome-banner__badges {
    align-self: flex-start;
  }
}
</style>
