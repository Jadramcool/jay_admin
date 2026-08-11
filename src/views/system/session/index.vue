<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import { h, ref } from 'vue'
import { SessionApi } from '@/api/system'
import { hasPermission } from '@/utils/common/hasPermission'

const tableRef = ref<any>(null)
const stats = ref({ online: 0, total: 0 })

const [register] = useForm({
  schemas: [],
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  return SessionApi.list(params)
}

function reload() {
  tableRef.value?.reload()
}

async function loadStats() {
  try {
    stats.value = await SessionApi.stats()
  }
  catch {
    /* handled by interceptor */
  }
}

async function handleKick(row: System.UserSession) {
  window.$dialog?.warning({
    title: '提示',
    content: `确定要强制下线「${row.userName || row.username}」的会话吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await SessionApi.kick(row.id)
        window.$message?.success?.('已强制下线')
        reload()
        loadStats()
      }
      catch {
        /* handled by interceptor */
      }
    },
  })
}

const columns = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '姓名', key: 'userName', width: 100, render: (row: System.UserSession) => row.userName || '-' },
  { title: 'IP 地址', key: 'ipAddress', width: 130, render: (row: System.UserSession) => row.ipAddress || '-' },
  { title: '浏览器', key: 'userAgent', width: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'expiresAt',
    width: 80,
    render: (row: System.UserSession) =>
      h(NTag, { type: new Date(row.expiresAt) > new Date() ? 'success' : 'default', bordered: false, size: 'small' }, {
        default: () => '在线',
      }),
  },
  { title: '登录时间', key: 'createdTime', width: 170 },
  { title: '过期时间', key: 'expiresAt', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: System.UserSession) =>
      hasPermission('system:session:kick')
        ? h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => handleKick(row) }, { default: () => '强制下线' })
        : '-',
  },
]
</script>

<template>
  <div class="system-page">
    <div class="mb-3 flex gap-3">
      <n-card size="small" class="flex-1">
        <div class="text-sm" style="color: var(--card-sub-text)">
          当前在线
        </div>
        <div class="text-xl font-bold" style="color: var(--success-color, #18a058)">
          {{ stats.online }}
        </div>
      </n-card>
      <n-card size="small" class="flex-1">
        <div class="text-sm" style="color: var(--card-sub-text)">
          会话总数
        </div>
        <div class="text-xl font-bold">
          {{ stats.total }}
        </div>
      </n-card>
    </div>

    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="在线用户"
      :columns="columns"
      :request="loadData"
      :show-add-btn="false"
      @refresh="loadStats"
    >
      <template #toolbar>
        <NButton size="small" @click="loadStats">
          刷新统计
        </NButton>
      </template>
    </BasicTable>
  </div>
</template>
