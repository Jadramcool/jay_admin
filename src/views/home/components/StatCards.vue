<script setup lang="ts">
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const stats = ref<Dashboard.Stats | null>(null)
const loading = ref(true)

const statItems = computed(() => [
  { label: '用户总数', value: stats.value?.userCount ?? '-', trend: stats.value?.userTrend, color: '#18a058', icon: 'U', sub: stats.value ? '系统注册用户' : '' },
  { label: '角色数量', value: stats.value?.roleCount ?? '-', color: '#2080f0', icon: 'R', sub: stats.value ? '权限角色配置' : '' },
  { label: '菜单数量', value: stats.value?.menuCount ?? '-', color: '#f0a020', icon: 'M', sub: stats.value ? '导航与路由项' : '' },
  { label: '部门数量', value: stats.value?.departmentCount ?? '-', color: '#7c3aed', icon: 'D', sub: stats.value ? '组织架构部门' : '' },
  { label: '操作日志', value: stats.value?.logCount ?? '-', color: '#d03050', icon: 'L', sub: stats.value ? `今日 ${stats.value.logTodayCount} 条` : '' },
  { label: '在线用户', value: stats.value?.onlineCount ?? '-', color: '#ec4899', icon: 'O', sub: stats.value ? '当前在线人数' : '' },
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
    /* keep defaults */
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card card--stats">
    <div class="card__bar" />
    <div class="card__body">
      <h3 class="card__title">
        数据概览
      </h3>
      <div class="stats__grid">
        <div v-for="(item, i) in statItems" :key="item.label" class="stat" :style="{ '--clr': item.color, '--i': i }">
          <n-skeleton v-if="loading && !stats" text :repeat="2" class="stat__skel" />
          <template v-else>
            <div class="stat__icon">
              {{ item.icon }}
            </div>
            <div class="stat__info">
              <span class="stat__val">{{ item.value }}</span>
              <div class="stat__meta">
                <span class="stat__label">{{ item.label }}</span>
                <span v-if="item.trend !== undefined && item.trend !== 0" class="stat__trend" :class="item.trend > 0 ? 'up' : 'dn'">
                  {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  border-radius: 14px;
  overflow: hidden;
  background: var(--card-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  html.dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
}

.card__bar {
  height: 3px;
  background: linear-gradient(90deg, #18a058, #36ad6a);
}

.card__body {
  padding: 18px 20px 20px;
}

.card__title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color-1);
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

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
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--clr) 5%, transparent);
  animation: fadeIn 0.35s ease both;
  animation-delay: calc(var(--i) * 0.05s);

  &:hover {
    background: color-mix(in srgb, var(--clr) 9%, transparent);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat__skel {
  width: 100%;
}

.stat__icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--clr) 12%, transparent);
  color: var(--clr);
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.stat__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat__val {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-color-1);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat__label {
  font-size: 12px;
  color: var(--text-color-4);
}

.stat__trend {
  font-size: 11px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 3px;
  line-height: 1.6;
  &.up {
    color: #18a058;
    background: rgba(24, 160, 88, 0.1);
  }
  &.dn {
    color: #d03050;
    background: rgba(208, 48, 80, 0.1);
  }
}
</style>
