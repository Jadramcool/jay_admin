<script setup lang="ts">
import { OperationLogApi } from '@/api/system'
import { useForm, useModal } from '@/components/index.ts'
import OperationLogDetailModal from './components/OperationLogDetailModal.vue'
import { useOperationLogSchema } from './schema'

const tableRef = ref<any>(null)
const [registerDetailModal, { openModal: openDetailModal }] = useModal()

const schemaMethods = {
  handleDetail(row: any) {
    openDetailModal({ record: row })
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: '提示',
      content: `确定要删除该操作日志吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await OperationLogApi.delete(row.id)
          window.$message?.success?.('删除成功')
          reload()
        }
        catch {
          /* handled by interceptor */
        }
      },
    })
  },
}

const { columns, formSchemas } = useOperationLogSchema(schemaMethods)

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  const filters = getFieldsValue()
  return OperationLogApi.list({ ...params, ...filters })
}

function reload() {
  tableRef.value?.reload()
}

async function handleBatchDelete(keys: number[]) {
  window.$dialog?.warning({
    title: '提示',
    content: `确定要删除选中的 ${keys.length} 条日志吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await OperationLogApi.batchDelete(keys)
        window.$message?.success?.('批量删除成功')
        reload()
      }
      catch {}
    },
  })
}

async function handleClearExpired() {
  window.$dialog?.warning({
    title: '提示',
    content: '确定要清理90天前的日志吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await OperationLogApi.clearExpired(90)
        window.$message?.success?.('清理成功')
        reload()
      }
      catch {}
    },
  })
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="操作日志"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="false"
      :show-batch-delete-btn="true"
      :scroll-x="1600"
      @batch-delete="handleBatchDelete"
    >
      <template #toolbar>
        <n-button type="warning" ghost size="small" @click="handleClearExpired">
          清理过期日志
        </n-button>
      </template>
    </BasicTable>
    <OperationLogDetailModal @register="registerDetailModal" />
  </div>
</template>
