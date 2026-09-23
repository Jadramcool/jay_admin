<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

const props = defineProps<{
  mine: Dashboard.MineInfo | null
  loading: boolean
}>()

const router = useRouter()

const todoTotal = computed(() => (props.mine?.todo.openCount ?? 0) + (props.mine?.todo.doneCount ?? 0))
const todoPercent = computed(() => {
  if (todoTotal.value === 0)
    return 100
  return Math.round(((props.mine?.todo.doneCount ?? 0) / todoTotal.value) * 100)
})

const unreadCount = computed(() => props.mine?.notice.unreadCount ?? 0)

/** 最近登录:取本人动态中最近的 LOGIN 记录 */
const lastLogin = computed(() => {
  const login = props.mine?.myActivities.find(act => act.operationType === 'LOGIN')
  if (!login)
    return null
  return formatWhen(login.time)
})

function formatWhen(time: string): string {
  const d = dayjs(time)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return `今天 ${d.format('HH:mm')}`
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return `昨天 ${d.format('HH:mm')}`
  return d.format('MM/DD HH:mm')
}

function goTodo() {
  router.push('/todo')
}

function goNotice() {
  router.push('/notice/notice')
}
</script>

<template>
  <AppCard content-style="padding: 14px 20px;">
    <div class="today" :class="{ 'today--loading': loading }">
      <button class="today__block" @click="goTodo">
        <span class="today__label">待办进度</span>
        <span class="today__value">
          {{ mine?.todo.doneCount ?? 0 }}<em>/{{ todoTotal }}</em>
        </span>
        <div class="today__bar">
          <div class="today__bar-fill" :style="{ width: `${todoPercent}%` }" />
        </div>
      </button>

      <div class="today__divider" />

      <button class="today__block" @click="goNotice">
        <span class="today__label">未读公告</span>
        <span class="today__value" :class="{ 'today__value--alert': unreadCount > 0 }">
          {{ unreadCount }}
        </span>
        <span class="today__hint">{{ unreadCount > 0 ? '点击前往阅读' : '暂无未读' }}</span>
      </button>

      <div class="today__divider" />

      <div class="today__block today__block--plain">
        <span class="today__label">最近登录</span>
        <span class="today__value today__value--small">{{ lastLogin ?? '—' }}</span>
        <span class="today__hint">{{ todoTotal === 0 ? '今天没有待办' : `还剩 ${mine?.todo.openCount ?? 0} 项待办` }}</span>
      </div>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
.today {
  display: flex;
  align-items: stretch;
  gap: 24px;
}

.today__block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 2px 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: var(--hover-color);
  }

  &--plain {
    cursor: default;

    &:hover {
      background: transparent;
    }
  }
}

.today__label {
  font-size: 12px;
  color: var(--text-color-4);
}

.today__value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-color-1);
  font-variant-numeric: tabular-nums;

  em {
    font-style: normal;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-4);
  }

  &--alert {
    color: #d03050;
  }

  &--small {
    font-size: 16px;
    font-weight: 700;
  }
}

.today__hint {
  font-size: 11.5px;
  color: var(--text-color-4);
}

.today__bar {
  width: 100%;
  max-width: 180px;
  height: 5px;
  border-radius: 3px;
  background: color-mix(in srgb, #18a058 10%, transparent);
  overflow: hidden;
}

.today__bar-fill {
  height: 100%;
  border-radius: 3px;
  background: #18a058;
  transition: width 0.6s ease;
}

.today__divider {
  width: 1px;
  background: var(--divider-color);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .today {
    flex-direction: column;
    gap: 14px;
  }

  .today__divider {
    width: 100%;
    height: 1px;
  }
}
</style>
