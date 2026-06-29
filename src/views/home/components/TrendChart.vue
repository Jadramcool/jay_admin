<script setup lang="ts">
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const trends = ref<Dashboard.Trends | null>(null)
const loading = ref(true)

const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const activeSeries = ref<'visits' | 'newUsers' | 'operations'>('visits')

const seriesMap: Record<string, { label: string, color: string }> = {
  visits: { label: '访问量', color: '#2080f0' },
  newUsers: { label: '新增用户', color: '#18a058' },
  operations: { label: '操作次数', color: '#f0a020' },
}

const barOption = computed(() => {
  if (!trends.value)
    return {}

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: 'var(--divider-color)',
      borderWidth: 1,
      textStyle: { color: 'var(--text-color-1)', fontSize: 12 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `<div style="font-weight:600;margin-bottom:4px">${p.axisValue}</div>${seriesMap[activeSeries.value].label}: <strong>${p.value}</strong>`
      },
    },
    grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
    xAxis: {
      type: 'category',
      data: trends.value.dates.map(d => `${Number(d.split('-')[1])}日`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: trends.value[activeSeries.value],
        itemStyle: {
          color: seriesMap[activeSeries.value].color,
          borderRadius: [3, 3, 0, 0],
        },
        barMaxWidth: 20,
        animationDuration: 600,
        animationEasing: 'cubicOut',
      },
    ],
  } as any
})

const totalValue = computed(() => {
  if (!trends.value)
    return 0
  return trends.value[activeSeries.value].reduce((a, b) => a + b, 0)
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

    <n-skeleton v-if="loading && !trends" :repeat="4" text />
    <template v-else>
      <VChart
        ref="chartRef"
        :option="barOption"
        autoresize
        class="trend-chart"
      />
      <div class="trend-card__summary">
        <span class="trend-card__summary-label">
          {{ seriesMap[activeSeries].label }} (7日汇总)
        </span>
        <span
          class="trend-card__summary-value"
          :style="{ color: seriesMap[activeSeries].color }"
        >
          {{ totalValue }}
        </span>
      </div>
    </template>
  </n-card>
</template>

<style lang="scss" scoped>
.trend-card {
  border-radius: var(--border-radius) !important;
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
  width: 100%;
  height: 120px;
}

.trend-card__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--divider-color);
}

.trend-card__summary-label {
  font-size: 12px;
  color: var(--text-color-3);
}

.trend-card__summary-value {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
