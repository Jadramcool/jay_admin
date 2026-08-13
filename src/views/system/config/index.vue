<script setup lang="ts">
import { shallowRef } from 'vue'
import { SysConfigApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModal } from '@/components/Modal'
import { hasPermission } from '@/utils/common/hasPermission'
import SysConfigModal from './components/SysConfigModal.vue'
import { useSysConfigSchema } from './schema'

interface TableInstance {
  reload: (options?: Record<string, unknown>) => Promise<void>
}

const tableRef = shallowRef<TableInstance | null>(null)
const [registerModal, { openModal }] = useModal()

const schemaMethods = {
  handleEdit(row: System.SysConfig) {
    openModal({ record: row, isUpdate: true })
  },
  async handleDelete(row: System.SysConfig) {
    await SysConfigApi.delete(row.id)
    window.$message?.success?.('删除成功')
    await reload()
  },
  async handleTogglePublic(row: System.SysConfig) {
    await SysConfigApi.updatePublicStatus(row.id, !row.isPublic)
    window.$message?.success?.(row.isPublic ? '已设为内部' : '已设为公开')
    await reload()
  },
}

const { columns, formSchemas } = useSysConfigSchema(schemaMethods)
const [registerForm, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

function loadData(params: Api.PageParams) {
  // 「全部」等空串条件不发送,后端不传即不过滤
  const query: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(getFieldsValue())) {
    if (value !== '' && value !== null && value !== undefined)
      query[key] = value
  }
  return SysConfigApi.list({ ...params, ...query })
}

async function reload() {
  await tableRef.value?.reload()
}

function handleAdd() {
  openModal({ isUpdate: false })
}

function handleBatchDelete(keys: number[]) {
  if (!keys.length) {
    window.$message?.warning?.('请先选择要删除的配置')
    return
  }

  window.$dialog?.warning({
    title: '批量删除',
    content: `确定删除选中的 ${keys.length} 条配置吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await SysConfigApi.batchDelete(keys)
      window.$message?.success?.('批量删除成功')
      await reload()
    },
  })
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="registerForm" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="系统配置"
      :columns="columns"
      :request="loadData"
      :row-key="(row: System.SysConfig) => row.id"
      :show-add-btn="hasPermission('system:config:create')"
      :show-batch-delete-btn="hasPermission('system:config:delete')"
      :scroll-x="1550"
      @add="handleAdd"
      @batch-delete="handleBatchDelete"
    />

    <SysConfigModal @register="registerModal" @success="reload" />
  </div>
</template>
