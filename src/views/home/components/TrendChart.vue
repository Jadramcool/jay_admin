<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{ visible: boolean }>()

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const trends = ref<Dashboard.Trends | null>(null)
const loading = ref(true)
const activeSeries = ref<'visits' | 'newUsers' | 'operations'>('visits')

const seriesConfig = {
  visits: { label: '访问量', color: '#2080f0' },
  newUsers: { label: '新增用户', color: '#18a058' },
  operations: { label: '操作次数', color: '#f0a020' },
}

function buildOption() {
  if (!trends.value)
    return {}
  const clr = seriesConfig[activeSeries.value].color
  const data = trends.value[activeSeries.value]
  const dates = trends.value.dates.map(d => `${Number(d.split('-')[1])}/${Number(d.split('-')[2])}`)
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--card-color)',
      borderColor: 'var(--divider-color)',
      borderWidth: 1,
      textStyle: { color: 'var(--text-color-1)', fontSize: 12 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `<div style="font-weight:600;margin-bottom:4px">${p.axisValue}</div><span style="color:${clr};font-weight:700;font-size:15px">${p.value}</span>`
      },
    },
    grid: { left: 0, right: 0, top: 8, bottom: 0, containLabel: false },
    xAxis: { type: 'category', data: dates, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    series: [{
      type: 'line',
      data,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2.5, color: clr },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${clr}50` }, { offset: 1, color: `${clr}05` }] } },
      animationDuration: 800,
      animationEasing: 'cubicOut',
    }],
  }
}

const chartOption = computed(() => buildOption())
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
    /* ignore */
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AppCard title="趋势分析" content-style="display:flex;flex-direction:column;padding:16px;flex:1">
    <template #header-extra>
      <div class="trend__tabs">
        <button v-for="(cfg, key) in seriesConfig" :key="key" class="trend__tab" :class="{ on: activeSeries === key }" :style="activeSeries === key ? { '--t': cfg.color } : {}" @click="activeSeries = key as 'visits' | 'newUsers' | 'operations'">
          {{ cfg.label }}
        </button>
      </div>
    </template>
    <n-skeleton v-if="loading && !trends" :repeat="4" text />
    <template v-else>
      <VChart :option="chartOption" autoresize class="trend__chart" />
      <div class="trend__total">
        <span class="trend__total-label">{{ seriesConfig[activeSeries].label }} · 近7日</span>
        <span class="trend__total-val" :style="{ color: seriesConfig[activeSeries].color }">{{ totalValue }}</span>
      </div>
    </template>
  </AppCard>
</template>

<style lang="scss" scoped>
.trend__tabs {
  display: flex;
  gap: 4px;
}

.trend__tab {
  padding: 3px 12px;
  border: none;
  border-radius: 8px;
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
  &.on {
    background: color-mix(in srgb, var(--t) 12%, transparent) !important;
    color: var(--t) !important;
    font-weight: 600;
  }
}

.trend__chart {
  flex: 1;
  width: 100%;
  min-height: 100px;
}

.trend__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 4px;
  border-top: 1px solid var(--divider-color);
}

.trend__total-label {
  font-size: 12px;
  color: var(--text-color-4);
}
.trend__total-val {
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
</style>
