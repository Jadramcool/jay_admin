<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import { h, reactive, ref } from 'vue'
import { DictApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'

interface DictItemForm {
  id: number
  typeId: number
  code: string
  label: string
  sortOrder: number
  status: 0 | 1
}

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const typeId = ref(0)
const typeName = ref('')
const items = ref<System.DictItem[]>([])
const loading = ref(false)

const formData = reactive<DictItemForm>({
  id: 0,
  typeId: 0,
  code: '',
  label: '',
  sortOrder: 0,
  status: 1,
})

const formRef = ref<any>(null)
const isEdit = ref(false)
const submitting = ref(false)

const [registerModal] = useModalInner((data: { typeId: number, typeName: string }) => {
  typeId.value = data.typeId
  typeName.value = data.typeName
  loadItems()
})

const rules = {
  code: [{ required: true, message: '请输入字典项编码', trigger: ['blur', 'input'] }],
  label: [{ required: true, message: '请输入显示文本', trigger: ['blur', 'input'] }],
}

async function loadItems() {
  loading.value = true
  try {
    const res = await DictApi.getItems({ typeId: typeId.value, page: 1, pageSize: 100 })
    items.value = res.items
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  isEdit.value = false
  formData.id = 0
  formData.typeId = typeId.value
  formData.code = ''
  formData.label = ''
  formData.sortOrder = 0
  formData.status = 1
}

function handleEdit(item: System.DictItem) {
  isEdit.value = true
  formData.id = item.id
  formData.typeId = item.typeId
  formData.code = item.code
  formData.label = item.label
  formData.sortOrder = item.sortOrder
  formData.status = item.status as 0 | 1
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await DictApi.updateItem({ ...formData })
    }
    else {
      await DictApi.createItem({ ...formData })
    }
    window.$message?.success?.(isEdit.value ? '更新成功' : '创建成功')
    resetForm()
    loadItems()
    emit('success')
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(item: System.DictItem) {
  window.$dialog?.warning({
    title: '提示',
    content: `确定要删除字典项「${item.label}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await DictApi.deleteItem(item.id)
        window.$message?.success?.('删除成功')
        loadItems()
        emit('success')
      }
      catch {
        /* handled by interceptor */
      }
    },
  })
}

async function handleToggleStatus(item: System.DictItem) {
  const newStatus = item.status === 1 ? 0 : 1
  try {
    await DictApi.updateItemStatus(item.id, newStatus as 0 | 1)
    loadItems()
    emit('success')
  }
  catch {
    /* handled by interceptor */
  }
}

const columns = [
  { title: '编码', key: 'code', width: 120 },
  { title: '显示文本', key: 'label', width: 120 },
  { title: '排序', key: 'sortOrder', width: 70 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: System.DictItem) =>
      h(NTag, { type: row.status === 1 ? 'success' : 'default', bordered: false, size: 'small' }, {
        default: () => (row.status === 1 ? '启用' : '禁用'),
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row: System.DictItem) =>
      h('div', { style: 'display: flex; gap: 8px' }, [
        h(NButton, { size: 'small', type: 'primary', quaternary: true, onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleToggleStatus(row) }, { default: () => (row.status === 1 ? '禁用' : '启用') }),
        h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ]),
  },
]
</script>

<template>
  <BasicModal title="字典项管理" :show-footer="false" width="680px" @register="registerModal">
    <div class="mb-3 text-sm">
      <span style="color: var(--card-sub-text)">
        字典类型：<b>{{ typeName }}</b>
      </span>
      <NButton size="small" type="primary" class="ml-3" @click="resetForm">
        新增字典项
      </NButton>
    </div>

    <n-data-table
      :columns="columns"
      :data="items"
      :loading="loading"
      size="small"
      :bordered="false"
      :pagination="false"
      max-height="360"
    />

    <n-divider style="margin-top: 12px" />
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      inline
      :label-width="80"
      class="mt-2"
    >
      <n-form-item label="编码" path="code">
        <n-input v-model:value="formData.code" placeholder="如 MALE" maxlength="50" style="width: 140px" />
      </n-form-item>
      <n-form-item label="文本" path="label">
        <n-input v-model:value="formData.label" placeholder="如 男" maxlength="50" style="width: 120px" />
      </n-form-item>
      <n-form-item label="排序" path="sortOrder">
        <n-input-number v-model:value="formData.sortOrder" :min="0" style="width: 90px" />
      </n-form-item>
      <n-form-item label="状态" path="status">
        <n-select v-model:value="formData.status" :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]" style="width: 90px" />
      </n-form-item>
      <n-form-item>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </NButton>
        <NButton class="ml-2" @click="resetForm">
          取消
        </NButton>
      </n-form-item>
    </n-form>
  </BasicModal>
</template>
