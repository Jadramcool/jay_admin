<script setup lang="ts">
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const trends = ref<Dashboard.Trends | null>(null)
const loading = ref(true)
const activeSeries = ref<'visits' | 'newUsers' | 'operations'>('visits')

const seriesMap: Record<string, { label: string, color: string }> = {
  visits: { label: '访问量', color: '#2080f0' },
  newUsers: { label: '新增用户', color: '#18a058' },
  operations: { label: '操作次数', color: '#f0a020' },
}

const chartData = computed(() => trends.value?.dates ?? [])
const chartValues = computed(() => {
  if (!trends.value)
    return []
  return trends.value[activeSeries.value] ?? []
})

const maxVal = computed(() => Math.max(...chartValues.value, 1))
const pathD = computed(() => {
  if (chartValues.value.length < 2)
    return ''
  const w = 100
  const h = 40
  const points = chartValues.value.map((v, i) => {
    const x = (i / (chartValues.value.length - 1)) * w
    const y = h - (v / maxVal.value) * h * 0.85 - 2
    return `${x},${y}`
  })
  return `M${points.join(' L')}`
})

const areaPathD = computed(() => {
  if (!pathD.value)
    return ''
  const w = 100
  const h = 40
  return `${pathD.value} L${w},${h} L0,${h} Z`
})

watch(() => props.visible, (v) => {
  if (v && !trends.value)
    loadTrends()
}, { immediate: true })

async function loadTrends() {
  loading.value = true
  try {
    trends.value = await DashboardApi.trends(7)
  }
  catch {
    // ignore
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <n-card title="趋势分析" size="small" :bordered="false" class="trend-card">
    <template #header-extra>
      <div class="trend-card__tabs">
        <button
          v-for="[key, s] in Object.entries(seriesMap)"
          :key="key"
          class="trend-card__tab"
          :class="{ 'trend-card__tab--active': activeSeries === key }"
          :style="activeSeries === key ? { '--tab-color': s.color } : {}"
          @click="activeSeries = key as 'visits' | 'newUsers' | 'operations'"
        >
          {{ s.label }}
        </button>
      </div>
    </template>

    <n-skeleton v-if="loading" :repeat="4" text />
    <template v-else>
      <div class="trend-chart">
        <svg
          viewBox="0 0 100 40"
          class="trend-chart__svg"
          preserveAspectRatio="none"
        >
          <path
            :d="areaPathD"
            fill="currentColor"
            class="trend-chart__area"
            :style="{ color: `color-mix(in srgb, ${seriesMap[activeSeries].color} 15%, transparent)` }"
          />
          <path
            :d="pathD"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="trend-chart__line"
            :style="{ color: seriesMap[activeSeries].color }"
          />
        </svg>

        <div class="trend-chart__labels">
          <span
            v-for="(d, i) in chartData"
            :key="d"
            class="trend-chart__label"
            :class="{ 'trend-chart__label--active': i === chartData.length - 1 }"
          >
            {{ Number(d.split('-')[1]) }}日
          </span>
        </div>

        <div class="trend-chart__summary">
          <span class="trend-chart__summary-label">
            {{ seriesMap[activeSeries].label }} (7日)
          </span>
          <span
            class="trend-chart__summary-value"
            :style="{ color: seriesMap[activeSeries].color }"
          >
            {{ chartValues.reduce((a, b) => a + b, 0) }}
          </span>
        </div>
      </div>
    </template>
  </n-card>
</template>

<style lang="scss" scoped>
.trend-card {
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 100%;

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

.trend-card__tabs {
  display: flex;
  gap: 4px;
}

.trend-card__tab {
  padding: 2px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color-3);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: var(--hover-color);
    color: var(--text-color-1);
  }

  &--active {
    background: color-mix(in srgb, var(--tab-color) 12%, transparent) !important;
    color: var(--tab-color) !important;
    font-weight: 600;
  }
}

.trend-chart {
  padding-top: 8px;
}

.trend-chart__svg {
  width: 100%;
  height: 60px;
}

.trend-chart__area {
  opacity: 0.6;
}

.trend-chart__line {
  filter: drop-shadow(0 0 4px currentColor);
}

html.dark .trend-chart__line {
  filter: drop-shadow(0 0 6px currentColor);
}

.trend-chart__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.trend-chart__label {
  font-size: 10px;
  color: var(--text-color-4);

  &--active {
    color: var(--text-color-2);
    font-weight: 600;
  }
}

.trend-chart__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--divider-color);
}

.trend-chart__summary-label {
  font-size: 12px;
  color: var(--text-color-3);
}

.trend-chart__summary-value {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
