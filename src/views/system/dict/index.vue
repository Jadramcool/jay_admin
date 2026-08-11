<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import { h, ref } from 'vue'
import { DictApi } from '@/api/system'
import { useForm, useModal } from '@/components/index.ts'
import { hasPermission } from '@/utils/common/hasPermission'
import DictItemModal from './components/DictItemModal.vue'
import DictTypeModal from './components/DictTypeModal.vue'

const tableRef = ref<any>(null)
const [registerTypeModal, { openModal: openTypeModal }] = useModal()
const [registerItemModal, { openModal: openItemModal }] = useModal()

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: [
    { field: 'code', label: '类型编码', component: 'NInput', componentProps: { placeholder: '请输入类型编码' } },
    { field: 'name', label: '类型名称', component: 'NInput', componentProps: { placeholder: '请输入类型名称' } },
  ],
  submitOnReset: true,
  tableRef,
})

async function loadData(params: any) {
  const filters = getFieldsValue()
  return DictApi.getTypes({ ...params, ...filters })
}

function reload() {
  tableRef.value?.reload()
}

function handleAdd() {
  openTypeModal()
}

function handleEdit(row: System.DictType) {
  openTypeModal(row)
}

function handleItems(row: System.DictType) {
  openItemModal({ typeId: row.id, typeName: row.name })
}

async function handleDelete(row: System.DictType) {
  window.$dialog?.warning({
    title: '提示',
    content: `确定要删除字典类型「${row.name}」及其字典项吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await DictApi.deleteType(row.id)
        window.$message?.success?.('删除成功')
        reload()
      }
      catch {
        /* handled by interceptor */
      }
    },
  })
}

async function handleToggleStatus(row: System.DictType) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await DictApi.updateTypeStatus(row.id, newStatus as 0 | 1)
    reload()
  }
  catch {
    /* handled by interceptor */
  }
}

const columns = [
  { title: '类型编码', key: 'code', width: 120 },
  { title: '类型名称', key: 'name', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: System.DictType) =>
      h(NTag, { type: row.status === 1 ? 'success' : 'default', bordered: false, size: 'small' }, {
        default: () => (row.status === 1 ? '启用' : '禁用'),
      }),
  },
  { title: '字典项数', key: 'itemCount', width: 80 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdTime', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    render: (row: System.DictType) =>
      h('div', { style: 'display: flex; gap: 8px' }, [
        h(NButton, { size: 'small', type: 'primary', quaternary: true, onClick: () => handleItems(row) }, { default: () => '字典项' }),
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleToggleStatus(row) }, { default: () => (row.status === 1 ? '禁用' : '启用') }),
        h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ]),
  },
]
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="数据字典"
      :columns="columns"
      :request="loadData"
      :show-add-btn="hasPermission('system:dict:create')"
      @add="handleAdd"
    >
      <template #toolbar>
        <NButton v-if="hasPermission('system:dict:list')" size="small" @click="reload">
          刷新
        </NButton>
      </template>
    </BasicTable>

    <DictTypeModal @register="registerTypeModal" @success="reload" />
    <DictItemModal @register="registerItemModal" />
  </div>
</template>
