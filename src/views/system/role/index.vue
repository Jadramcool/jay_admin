<script setup lang="ts">
import { RoleApi } from '@/api/notice/index.ts'
import RoleMenuModal from './components/RoleMenuModal.vue'
import RoleModal from './components/RoleModal.vue'
import { useRoleSchema } from './schema'

const tableRef = ref<any>(null)
const [registerModal, { openModal }] = useModal()
const [registerMenuModal, { openModal: openMenuModal }] = useModal()

const schemaMethods = {
  handleEdit(row: any) {
    openModal({ record: row, isUpdate: true })
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: '提示',
      content: `确定要删除角色「${row.name}」吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await RoleApi.delete(row.id)
        window.$message?.success?.('删除成功')
        reload()
      },
    })
  },
  handleAuth(row: any) {
    openMenuModal({ record: row })
  },
}

const { columns, formSchemas } = useRoleSchema(schemaMethods)

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  const filters = getFieldsValue()
  return RoleApi.list({ ...params, ...filters })
}

function reload() {
  tableRef.value?.reload()
}

function handleAdd() {
  openModal({ isUpdate: false })
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="角色管理"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="true"
      @add="handleAdd"
    />

    <RoleModal @register="registerModal" @success="reload" />
    <RoleMenuModal @register="registerMenuModal" @success="reload" />
  </div>
</template>
