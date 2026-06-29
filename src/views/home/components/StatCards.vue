<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const stats = ref<Dashboard.Stats | null>(null)
const loading = ref(true)

const cards = computed(() => [
  {
    label: '用户总数',
    value: stats.value?.userCount ?? '-',
    trend: stats.value?.userTrend,
    icon: 'icon-park-outline:user',
    color: '#18a058',
    bg: 'rgba(24,160,88,0.10)',
    sub: '系统注册用户',
  },
  {
    label: '角色数量',
    value: stats.value?.roleCount ?? '-',
    icon: 'icon-park-outline:permissions',
    color: '#2080f0',
    bg: 'rgba(32,128,240,0.10)',
    sub: '权限角色配置',
  },
  {
    label: '菜单数量',
    value: stats.value?.menuCount ?? '-',
    icon: 'icon-park-outline:menu-fold',
    color: '#f0a020',
    bg: 'rgba(240,160,32,0.10)',
    sub: '导航与路由项',
  },
  {
    label: '部门数量',
    value: stats.value?.departmentCount ?? '-',
    icon: 'icon-park-outline:tree',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    sub: '组织架构部门',
  },
  {
    label: '操作日志',
    value: stats.value?.logCount ?? '-',
    icon: 'icon-park-outline:log',
    color: '#d03050',
    bg: 'rgba(208,48,80,0.10)',
    sub: `今日 ${stats.value?.logTodayCount ?? 0} 条`,
  },
  {
    label: '在线用户',
    value: stats.value?.onlineCount ?? '-',
    icon: 'icon-park-outline:link-cloud',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.10)',
    sub: '当前在线人数',
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
  <n-grid cols="1 s:2 m:3 l:6" :x-gap="14" :y-gap="14" class="stat-grid">
    <n-gi v-for="card in cards" :key="card.label">
      <div
        class="stat-card"
        :style="{ '--stat-color': card.color, '--stat-bg': card.bg }"
      >
        <n-skeleton v-if="loading && !stats" text :repeat="3" />
        <template v-else>
          <div class="stat-card__header">
            <span class="stat-card__label">{{ card.label }}</span>
            <div class="stat-card__icon">
              <Icon :icon="card.icon" />
            </div>
          </div>
          <div class="stat-card__value-row">
            <span class="stat-card__number">{{ card.value }}</span>
            <span
              v-if="card.trend !== undefined && card.trend !== 0"
              class="stat-card__trend"
              :class="{ 'stat-card__trend--up': card.trend > 0, 'stat-card__trend--down': card.trend < 0 }"
            >
              <Icon
                :icon="card.trend > 0 ? 'icon-park-outline:trending-up' : 'icon-park-outline:trending-down'"
              />
              {{ Math.abs(card.trend) }}%
            </span>
          </div>
          <div class="stat-card__footer">
            {{ card.sub }}
          </div>
        </template>
      </div>
    </n-gi>
  </n-grid>
</template>

<style lang="scss" scoped>
.stat-grid {
  margin: 0 !important;
}

.stat-card {
  padding: 16px 18px;
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

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-card__label {
  font-size: 13px;
  color: var(--text-color-3);
  font-weight: 500;
}

.stat-card__icon {
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

.stat-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.stat-card__number {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-color-1);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 4px;
  line-height: 1.6;

  &--up {
    color: #18a058;
    background: rgba(24, 160, 88, 0.1);
  }

  &--down {
    color: #d03050;
    background: rgba(208, 48, 80, 0.1);
  }
}

.stat-card__footer {
  font-size: 12px;
  color: var(--text-color-4);
}

@media (max-width: 768px) {
  .stat-card__number {
    font-size: 22px;
  }
}
</style>
