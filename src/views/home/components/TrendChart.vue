<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useTrendChart } from './useTrendChart'

const props = defineProps<{ visible: boolean }>()

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const { trends, loading, activeSeries, seriesConfig, chartOption, totalValue } = useTrendChart(toRef(props, 'visible'))

// pageview 数据早期为 0 时的空态(不做除零/无意义平线展示)
const visitsEmpty = computed(() =>
  activeSeries.value === 'visits'
  && !!trends.value
  && trends.value.visits.every(v => v === 0),
)
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
    <div v-else-if="visitsEmpty" class="trend__empty">
      暂无访问数据
    </div>
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

.trend__empty {
  flex: 1;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-4);
  font-size: 13px;
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
