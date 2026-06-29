<script setup lang="ts">
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
  return ['日', '一', '二', '三', '四', '五', '六'][dayjs().day()]
})

const now = ref(dayjs().format('HH:mm:ss'))
let timer: ReturnType<typeof setInterval>

function initGreeting() {
  const n = dayjs()
  now.value = n.format('HH:mm')
  document.documentElement.style.setProperty('--greeting-hour', String(n.hour()))
}

onMounted(() => {
  initGreeting()
  timer = setInterval(() => {
    now.value = dayjs().format('HH:mm')
  }, 15000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <n-card :bordered="false" size="small" class="hero">
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__orb hero__orb--a" />
      <div class="hero__orb hero__orb--b" />
      <div class="hero__grid" />
    </div>

    <div class="hero__content">
      <div class="hero__identity">
        <div class="hero__avatar">
          <n-avatar
            v-if="user?.avatar"
            :src="user.avatar"
            :size="44"
            round
          />
          <n-avatar v-else :size="44" round class="hero__avatar-fallback">
            {{ user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? '?' }}
          </n-avatar>
        </div>
        <div class="hero__text">
          <h1 class="hero__greeting">
            {{ greeting }}，{{ user?.name ?? user?.username }}
          </h1>
          <p class="hero__meta">
            <span class="hero__time">{{ now }}</span>
            <span class="hero__dot">·</span>
            <span>星期{{ weekday }}</span>
            <span v-if="user?.departmentName" class="hero__dot">·</span>
            <span v-if="user?.departmentName">{{ user.departmentName }}</span>
          </p>
        </div>
      </div>
      <div class="hero__tags">
        <span v-if="isAdmin" class="hero__tag hero__tag--admin">管理员</span>
        <span v-else class="hero__tag hero__tag--user">用户</span>
        <span v-if="user?.position" class="hero__tag hero__tag--position">{{ user.position }}</span>
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.hero {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  background: var(--card-color);

  html.dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    background: var(--card-color);
  }

  :deep(.n-card-header) {
    display: none;
  }

  :deep(.n-card__content) {
    padding: 28px 32px !important;
  }
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;

  &--a {
    width: 400px;
    height: 400px;
    top: -160px;
    right: -80px;
    background: color-mix(in srgb, var(--primary-color) 30%, transparent);
  }

  &--b {
    width: 200px;
    height: 200px;
    bottom: -60px;
    left: 20%;
    background: color-mix(in srgb, #2080f0 20%, transparent);
  }
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;

  html.dark & {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
}

.hero__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hero__identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero__avatar {
  flex-shrink: 0;
}

.hero__avatar-fallback {
  background: color-mix(in srgb, var(--primary-color) 20%, transparent) !important;
  color: var(--primary-color) !important;
  font-weight: 700;
  font-size: 16px;
}

.hero__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero__greeting {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-color-1);
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.hero__meta {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero__time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--text-color-2);
}

.hero__dot {
  color: var(--divider-color);
}

.hero__tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.hero__tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;

  &--admin {
    background: color-mix(in srgb, var(--primary-color) 15%, transparent);
    color: var(--primary-color);
  }

  &--user {
    background: color-mix(in srgb, #2080f0 12%, transparent);
    color: #2080f0;
  }

  &--position {
    background: color-mix(in srgb, rgb(212, 168, 83) 12%, transparent);
    color: rgb(212, 168, 83);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 20px;
  }

  .hero__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero__greeting {
    font-size: 18px;
  }
}
</style>
