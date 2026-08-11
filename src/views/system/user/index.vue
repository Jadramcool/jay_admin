<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { UserManagerApi } from '@/api/system'
import { useForm, useModal } from '@/components/index.ts'
import { hasPermission } from '@/utils/common/hasPermission'
import { downloadBlob } from '@/utils/download'
import UserImportModal from './components/UserImportModal.vue'
import UserResetPwdModal from './components/UserResetPwdModal.vue'
import UserRoleModal from './components/UserRoleModal.vue'
import { useUserSchema } from './schema'

const tableRef = ref<any>(null)
const [registerRoleModal, { openModal: openRoleModal }] = useModal()
const [registerPwdModal, { openModal: openPwdModal }] = useModal()
const [registerImportModal, { openModal: openImportModal }] = useModal()
const router = useRouter()

const schemaMethods = {
  handleEdit(row: any) {
    router.push(`/system/user/edit/${row.id}`)
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: '提示',
      content: `确定要删除用户「${row.username}」吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await UserManagerApi.delete(row.id)
          window.$message?.success?.('删除成功')
          reload()
        }
        catch {
          /* handled by interceptor */
        }
      },
    })
  },
  handleEnable(row: any) {
    const newStatus = row.status === 1 ? 0 : 1
    UserManagerApi.updateStatus(row.id, newStatus as 0 | 1)
      .then(() => {
        window.$message?.success?.(newStatus ? '已启用' : '已禁用')
        reload()
      })
      .catch(() => {})
  },
  handleAssignRole(row: any) {
    openRoleModal({ record: row })
  },
  handleResetPwd(row: any) {
    openPwdModal({ record: row })
  },
}

const { columns, formSchemas } = useUserSchema(schemaMethods)

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  const filters = getFieldsValue()
  return UserManagerApi.list({ ...params, ...filters })
}

/** 导出用户列表(按当前筛选条件全量) */
async function handleExport() {
  try {
    const filters = getFieldsValue()
    const blob = await UserManagerApi.exportExcel(filters)
    downloadBlob(blob, `用户列表_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
  }
  catch {
    /* handled by interceptor */
  }
}

function reload() {
  tableRef.value?.reload()
}

function handleAdd() {
  router.push('/system/user/edit')
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="用户管理"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="hasPermission('system:user:create')"
      :scroll-x="1470"
      @add="handleAdd"
    >
      <template #toolbar>
        <n-button v-if="hasPermission('system:user:list')" size="small" @click="handleExport">
          导出
        </n-button>
        <n-button
          v-if="hasPermission('system:user:create')"
          size="small"
          type="primary"
          ghost
          @click="openImportModal()"
        >
          导入
        </n-button>
      </template>
    </BasicTable>
    <UserRoleModal @register="registerRoleModal" @success="reload" />
    <UserResetPwdModal @register="registerPwdModal" />
    <UserImportModal @register="registerImportModal" @success="reload" />
  </div>
</template>
