import { DashboardApi } from '@/api/dashboard'

export type TrendSeriesKey = 'visits' | 'newUsers' | 'operations'

export function useTrendChart(visible: Ref<boolean>) {
  const trends = ref<Dashboard.Trends | null>(null)
  const loading = ref(true)
  const activeSeries = ref<TrendSeriesKey>('visits')

  // 口径:visits = 前端上报的 pageview 事件数(非操作量);operations = 操作日志条数
  const seriesConfig: Record<TrendSeriesKey, { label: string, color: string }> = {
    visits: { label: '页面访问量', color: '#2080f0' },
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
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, left: 8, right: 8, top: 8, bottom: 8 },
      xAxis: { type: 'category', data: dates, axisTick: { alignWithLabel: true } },
      yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [{
        type: 'line',
        // tooltip 中显示口径名称(如"页面访问量")
        name: seriesConfig[activeSeries.value].label,
        data,
        smooth: true,
        lineStyle: { color: clr },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${clr}30` },
              { offset: 1, color: `${clr}03` },
            ],
          },
        },
      }],
    }
  }

  const chartOption = computed(() => buildOption())

  const totalValue = computed(() => {
    if (!trends.value)
      return 0
    return trends.value[activeSeries.value].reduce((a, b) => a + b, 0)
  })

  watch(() => visible.value, (v) => {
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

  return {
    trends,
    loading,
    activeSeries,
    seriesConfig,
    chartOption,
    totalValue,
  }
}
