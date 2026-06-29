<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'vue-router'
import { DashboardApi } from '@/api/dashboard'
import 'dayjs/locale/zh-cn'

const props = defineProps<{
  visible: boolean
}>()

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
const router = useRouter()

const activities = ref<Dashboard.Activity[]>([])
const loading = ref(true)

const typeColor: Record<string, string> = {
  CREATE: '#18a058',
  UPDATE: '#2080f0',
  DELETE: '#d03050',
  LOGIN: '#7c3aed',
  LOGOUT: '#f0a020',
}

const typeLabel: Record<string, string> = {
  CREATE: '新增',
  UPDATE: '修改',
  DELETE: '删除',
  LOGIN: '登录',
  LOGOUT: '登出',
}

function formatTime(time: string): string {
  const d = dayjs(time)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return '昨天'
  return d.format('MM/DD')
}

watch(() => props.visible, (v) => {
  if (v && activities.value.length === 0)
    loadActivities()
}, { immediate: true })

async function loadActivities() {
  loading.value = true
  try {
    activities.value = await DashboardApi.activities(8)
  }
  catch {
    activities.value = []
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="activity">
    <div class="activity__top">
      <h3 class="activity__title">
        实时动态
      </h3>
      <button class="activity__more" @click="router.push('/system/operation-log')">
        查看全部
      </button>
    </div>

    <n-skeleton v-if="loading" :repeat="6" text />

    <div v-else-if="activities.length === 0" class="activity__empty">
      暂无动态
    </div>

    <div v-else class="activity__list">
      <div
        v-for="(act, i) in activities"
        :key="act.id"
        class="activity__item"
        :style="{ '--i': i }"
      >
        <div class="activity__line">
          <div class="activity__dot" :style="{ background: typeColor[act.operationType] || '#909090' }" />
          <div v-if="i < activities.length - 1" class="activity__bar" />
        </div>
        <div class="activity__body">
          <div class="activity__head">
            <span class="activity__user">{{ act.username }}</span>
            <span class="activity__op" :style="{ background: `${typeColor[act.operationType] || '#909090'}18`, color: typeColor[act.operationType] || '#909090' }">
              {{ typeLabel[act.operationType] || act.operationType }}
            </span>
            <span class="activity__module">{{ act.module }}</span>
          </div>
          <div class="activity__foot">
            <span class="activity__desc">{{ act.action }}</span>
            <span class="activity__time">{{ formatTime(act.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity {
  padding: 20px 22px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--card-color) 90%, transparent);
  height: 100%;
}

.activity__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.activity__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color-1);
}

.activity__more {
  border: none;
  background: transparent;
  color: var(--text-color-4);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-color);
    color: var(--text-color-1);
  }
}

.activity__list {
  display: flex;
  flex-direction: column;
}

.activity__item {
  display: flex;
  gap: 12px;
  animation: slideIn 0.35s ease both;
  animation-delay: calc(var(--i) * 0.04s);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.activity__line {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 8px;
  flex-shrink: 0;
  padding-top: 6px;
}

.activity__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  flex-shrink: 0;
  z-index: 1;
}

.activity__bar {
  width: 1.5px;
  flex: 1;
  background: var(--divider-color);
  margin: 2px 0;
}

.activity__body {
  flex: 1;
  min-width: 0;
  padding-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.activity__user {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}

.activity__op {
  padding: 0 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
}

.activity__module {
  font-size: 11.5px;
  color: var(--text-color-4);
}

.activity__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activity__desc {
  font-size: 12px;
  color: var(--text-color-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.activity__time {
  font-size: 11px;
  color: var(--text-color-4);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.activity__empty {
  text-align: center;
  padding: 24px 0;
  color: var(--text-color-4);
  font-size: 13px;
}
</style>
