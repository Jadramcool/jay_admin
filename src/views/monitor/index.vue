<script setup lang="ts">
import { NTag } from 'naive-ui'
import { h, ref } from 'vue'
import { MetricsApi } from '@/api/metrics'

const tableRef = ref<any>(null)
const stats = ref({ total: 0, errors: 0, pageviews: 0, todayErrors: 0 })

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: [
    {
      field: 'type',
      label: '事件类型',
      component: 'NSelect',
      componentProps: {
        placeholder: '全部类型',
        options: [
          { label: '错误', value: 'error' },
          { label: '页面访问', value: 'pageview' },
        ],
      },
    },
  ],
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  const filters = getFieldsValue()
  return MetricsApi.getEvents({ ...params, ...filters })
}

function reload() {
  tableRef.value?.reload()
}

async function loadStats() {
  try {
    stats.value = await MetricsApi.getStats()
  }
  catch {
    /* handled by interceptor */
  }
}

const columns = [
  {
    title: '类型',
    key: 'type',
    width: 90,
    render: (row: System.ClientEvent) =>
      h(NTag, { type: row.type === 'error' ? 'error' : 'info', bordered: false, size: 'small' }, {
        default: () => (row.type === 'error' ? '错误' : '访问'),
      }),
  },
  { title: '分类', key: 'category', width: 160 },
  { title: '消息', key: 'message', ellipsis: { tooltip: true } },
  { title: '路由', key: 'route', width: 160, ellipsis: { tooltip: true } },
  { title: '用户ID', key: 'userId', width: 80, render: (row: System.ClientEvent) => row.userId ?? '-' },
  { title: '浏览器', key: 'browser', width: 140 },
  { title: '时间', key: 'createdTime', width: 170 },
]
</script>

<template>
  <div class="system-page">
    <div class="mb-3 grid grid-cols-4 gap-3">
      <n-card size="small">
        <div class="text-sm" style="color: var(--card-sub-text)">
          事件总数
        </div>
        <div class="text-xl font-bold">
          {{ stats.total }}
        </div>
      </n-card>
      <n-card size="small">
        <div class="text-sm" style="color: var(--card-sub-text)">
          错误总数
        </div>
        <div class="text-xl font-bold" style="color: var(--error-color, #d03050)">
          {{ stats.errors }}
        </div>
      </n-card>
      <n-card size="small">
        <div class="text-sm" style="color: var(--card-sub-text)">
          页面访问
        </div>
        <div class="text-xl font-bold">
          {{ stats.pageviews }}
        </div>
      </n-card>
      <n-card size="small">
        <div class="text-sm" style="color: var(--card-sub-text)">
          今日错误(24h)
        </div>
        <div class="text-xl font-bold" style="color: var(--warning-color, #f0a020)">
          {{ stats.todayErrors }}
        </div>
      </n-card>
    </div>

    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="前端监控"
      :columns="columns"
      :request="loadData"
      :show-add-btn="false"
      @refresh="loadStats"
    >
      <template #toolbar>
        <n-button size="small" @click="loadStats">
          刷新统计
        </n-button>
      </template>
    </BasicTable>
  </div>
</template>
