<script setup lang="ts">
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const stats = ref<Dashboard.Stats | null>(null)
const loading = ref(true)

const statItems = computed(() => [
  {
    label: '用户总数',
    value: stats.value?.userCount ?? '-',
    trend: stats.value?.userTrend,
    color: '#18a058',
    icon: 'U',
    sub: stats.value ? '系统注册用户' : '',
  },
  {
    label: '角色数量',
    value: stats.value?.roleCount ?? '-',
    color: '#2080f0',
    icon: 'R',
    sub: stats.value ? '权限角色配置' : '',
  },
  {
    label: '菜单数量',
    value: stats.value?.menuCount ?? '-',
    color: '#f0a020',
    icon: 'M',
    sub: stats.value ? '导航与路由项' : '',
  },
  {
    label: '部门数量',
    value: stats.value?.departmentCount ?? '-',
    color: '#7c3aed',
    icon: 'D',
    sub: stats.value ? '组织架构部门' : '',
  },
  {
    label: '操作日志',
    value: stats.value?.logCount ?? '-',
    color: '#d03050',
    icon: 'L',
    sub: stats.value ? `今日 ${stats.value.logTodayCount} 条` : '',
  },
  {
    label: '在线用户',
    value: stats.value?.onlineCount ?? '-',
    color: '#ec4899',
    icon: 'O',
    sub: stats.value ? '当前在线人数' : '',
  },
])

watch(() => props.visible, (v) => {
  if (v && !stats.value)
    loadStats()
}, { immediate: true })

async function loadStats() {
  loading.value = true
  try {
    stats.value = await DashboardApi.stats()
  }
  catch {
    // keep defaults
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="stats">
    <div
      v-for="(item, i) in statItems"
      :key="item.label"
      class="stat"
      :style="{ '--stat-clr': item.color, '--i': i }"
    >
      <n-skeleton v-if="loading && !stats" text :repeat="2" :style="{ '--i': i }" class="stat__skeleton" />
      <template v-else>
        <div class="stat__icon">
          {{ item.icon }}
        </div>
        <div class="stat__body">
          <span class="stat__value">{{ item.value }}</span>
          <div class="stat__footer">
            <span class="stat__label">{{ item.label }}</span>
            <span v-if="item.trend !== undefined && item.trend !== 0" class="stat__trend" :class="item.trend > 0 ? 'stat__trend--up' : 'stat__trend--down'">
              {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--card-color) 90%, transparent);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease;
  animation: statIn 0.4s ease both;
  animation-delay: calc(var(--i) * 0.05s);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.06),
      0 0 0 1px color-mix(in srgb, var(--stat-clr) 10%, transparent);
  }
}

@keyframes statIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat__skeleton {
  width: 100%;
}

.stat__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--stat-clr) 12%, transparent);
  color: var(--stat-clr);
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.stat:hover .stat__icon {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--stat-clr) 18%, transparent);
}

.stat__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat__value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-color-1);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat__footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat__label {
  font-size: 12.5px;
  color: var(--text-color-3);
}

.stat__trend {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.5;

  &--up {
    color: #18a058;
    background: rgba(24, 160, 88, 0.1);
  }

  &--down {
    color: #d03050;
    background: rgba(208, 48, 80, 0.1);
  }
}
</style>
