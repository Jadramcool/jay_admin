<script setup lang="ts">
import { Icon } from '@iconify/vue'
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

function operationTypeColor(type: string): string {
  const map: Record<string, string> = {
    CREATE: '#18a058',
    UPDATE: '#2080f0',
    DELETE: '#d03050',
    LOGIN: '#7c3aed',
    LOGOUT: '#f0a020',
    READ: '#0ec7b0',
    EXPORT: '#ec4899',
    IMPORT: '#909090',
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
  <n-card title="实时动态" size="small" :bordered="false" class="activity-card">
    <template #header-extra>
      <n-button
        text
        size="tiny"
        @click="router.push('/system/operation-log')"
      >
        查看全部
        <template #icon>
          <Icon icon="icon-park-outline:right" />
        </template>
      </n-button>
    </template>

    <n-skeleton v-if="loading" :repeat="6" text />

    <n-thing v-else-if="activities.length === 0" class="activity-empty">
      <template #description>
        暂无动态
      </template>
    </n-thing>

    <div v-else class="activity-list">
      <div
        v-for="act in activities"
        :key="act.id"
        class="activity-item"
      >
        <div
          class="activity-item__dot"
          :style="{ background: operationTypeColor(act.operationType) }"
        />
        <div class="activity-item__body">
          <div class="activity-item__top">
            <span class="activity-item__user">{{ act.username }}</span>
            <n-tag
              :color="{
                textColor: '#fff',
                borderColor: operationTypeColor(act.operationType),
                color: operationTypeColor(act.operationType),
              }"
              size="tiny"
              :bordered="false"
              round
            >
              {{ operationTypeLabel(act.operationType) }}
            </n-tag>
            <span class="activity-item__module">{{ act.module }}</span>
          </div>
          <div class="activity-item__bottom">
            <span class="activity-item__desc">{{ act.action }}</span>
            <span class="activity-item__time">{{ formatTime(act.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.activity-card {
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

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 9px 0;
  cursor: default;
  border-bottom: 1px solid var(--divider-color);
  margin: 0 -6px;
  padding: 9px 6px;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--hover-color);
  }
}

.activity-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}

.activity-item__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item__top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-item__user {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}

.activity-item__module {
  font-size: 11.5px;
  color: var(--text-color-3);
  background: var(--hover-color);
  padding: 0 5px;
  border-radius: 4px;
  line-height: 1.6;
}

.activity-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activity-item__desc {
  font-size: 12px;
  color: var(--text-color-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.activity-item__time {
  font-size: 11px;
  color: var(--text-color-4);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.activity-empty {
  :deep(.n-thing-description) {
    text-align: center;
    padding: 20px 0;
    color: var(--text-color-4);
    font-size: 13px;
  }
}
</style>
