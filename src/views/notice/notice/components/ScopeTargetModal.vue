<script setup lang="ts">
import { computed, ref } from 'vue'
import { DepartmentApi, RoleApi, UserManagerApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { BasicModal, useModalInner } from '@/components/Modal'
import { useNoticeSchema } from '../schema.tsx'

const emit = defineEmits<{
  register: [instance: any, uuid: number]
  confirm: [targets: { targetType: string, targetId: number, targetName?: string }[]]
}>()

const { roleColumns, departmentColumns, userColumns } = useNoticeSchema()

const scopeType = ref('')

const existingKeys = ref<Set<string>>(new Set())
const checkedRowKeys = ref<(string | number)[]>([])
const itemNameMap = ref<Record<number, string>>({})

const tableRef = ref<any>(null)

const searchSchemas = computed(() => {
  if (scopeType.value === 'ROLE') {
    return [
      {
        field: 'code',
        label: '角色编码',
        component: 'NInput' as const,
        componentProps: { placeholder: '角色编码' },
      },
      {
        field: 'name',
        label: '角色名称',
        component: 'NInput' as const,
        componentProps: { placeholder: '角色名称' },
      },
    ]
  }
  if (scopeType.value === 'DEPARTMENT') {
    return [
      {
        field: 'name',
        label: '名称',
        component: 'NInput' as const,
        componentProps: { placeholder: '部门名称' },
      },
    ]
  }
  return [
    {
      field: 'username',
      label: '用户名',
      component: 'NInput' as const,
      componentProps: { placeholder: '用户名' },
    },
    {
      field: 'name',
      label: '姓名',
      component: 'NInput' as const,
      componentProps: { placeholder: '姓名' },
    },
  ]
})

const [registerForm, { getFieldsValue }] = useForm({
  schemas: searchSchemas,
  gridProps: { cols: '1 s:1 m:2 l:2 xl:2' },
  showActionButtonGroup: true,
  submitButtonText: '搜索',
  submitOnReset: true,
  tableRef,
})

function getPreselectedKeys(): (string | number)[] {
  return Array.from(existingKeys.value)
    .filter(k => k.startsWith(`${scopeType.value}-`))
    .map(k => Number(k.split('-')[1]))
    .filter(id => !Number.isNaN(id))
}

function reloadTable() {
  const table = tableRef.value
  if (table) {
    table.setPagination?.({ page: 1 })
    table.reload()
  }
}

async function loadTargetData(params: any) {
  const filters = getFieldsValue()
  const apiParams = { ...params, ...filters }

  let res: any
  if (scopeType.value === 'ROLE') {
    res = await RoleApi.list(apiParams)
  }
  else if (scopeType.value === 'DEPARTMENT') {
    res = await DepartmentApi.list(apiParams)
  }
  else {
    res = await UserManagerApi.list(apiParams)
  }

  const list = Array.isArray(res) ? res : res?.list || []
  const pagination = res?.pagination || { total: list.length }

  itemNameMap.value = {}
  list.forEach((item: any) => {
    itemNameMap.value[item.id]
      = item.name || item.username || `目标#${item.id}`
  })

  if (checkedRowKeys.value.length === 0) {
    checkedRowKeys.value = getPreselectedKeys()
  }

  return { list, pagination }
}

function handleConfirm() {
  const selected = checkedRowKeys.value.map(id => ({
    targetType: scopeType.value,
    targetId: id as number,
    targetName: itemNameMap.value[id as number] || `目标#${id}`,
  }))
  emit('confirm', selected)
}

const [registerModal] = useModalInner(async (data: any) => {
  scopeType.value = data?.scopeType || ''
  existingKeys.value = new Set(data?.existingKeys || [])
  checkedRowKeys.value = []
  itemNameMap.value = {}
})
</script>

<template>
  <BasicModal
    title="选择范围目标"
    :width="1000"
    @register="registerModal"
    @ok="handleConfirm"
  >
    <FormQuery @register="registerForm" @submit="reloadTable" />
    <BasicTable
      v-if="scopeType === 'ROLE'"
      ref="tableRef"
      :columns="roleColumns"
      :request="loadTargetData"
      :show-toolbar="false"
      size="small"
      :bordered="true"
      :row-key="(row: any) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="(keys: any) => (checkedRowKeys = keys)"
    />
    <BasicTable
      v-else-if="scopeType === 'DEPARTMENT'"
      ref="tableRef"
      :columns="departmentColumns"
      :request="loadTargetData"
      :show-toolbar="false"
      size="small"
      :bordered="true"
      :row-key="(row: any) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="(keys: any) => (checkedRowKeys = keys)"
    />
    <BasicTable
      v-else-if="scopeType === 'USER'"
      ref="tableRef"
      :columns="userColumns"
      :request="loadTargetData"
      :show-toolbar="false"
      size="small"
      :bordered="true"
      :row-key="(row: any) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="(keys: any) => (checkedRowKeys = keys)"
    />
  </BasicModal>
</template>
