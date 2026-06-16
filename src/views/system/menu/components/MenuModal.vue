<script setup lang="ts">
import { ref } from 'vue'
import { MenuApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useMenuSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const isUpdate = ref(false)
const editingId = ref<number | null>(null)

const { editFormSchemas } = useMenuSchema()

const [
  registerForm,
  { setFieldsValue, resetFields, validate, getFieldsValue },
] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
  gridProps: { 'cols': 2, 'x-gap': 16 },
})

const [registerModal, { closeModal, setModalProps }] = useModalInner(
  (data: any) => {
    isUpdate.value = !!data?.isUpdate
    resetFields()
    if (isUpdate.value) {
      editingId.value = data.record.id
      const record = { ...data.record }
      // 从 extraData JSON 中提取虚拟字段
      if (record.extraData && typeof record.extraData === 'object') {
        Object.assign(record, record.extraData)
      }
      else if (typeof record.extraData === 'string') {
        try {
          Object.assign(record, JSON.parse(record.extraData))
        }
        catch { /* ignore invalid JSON */ }
      }
      delete record.extraData
      setFieldsValue(record)
    }
    else if (data?.record?.pid) {
      editingId.value = null
      setFieldsValue({ pid: data.record.pid })
    }
  },
)

async function handleOk() {
  try {
    await validate()
  }
  catch {
    return
  }
  setModalProps({ loading: true })
  try {
    const values = {
      ...getFieldsValue(),
    }
    // 将虚拟字段序列化回 extraData
    const extraDataFields = ['withContentCard']
    const extraData: Record<string, any> = {}
    extraDataFields.forEach((key) => {
      if (key in values) {
        extraData[key] = values[key]
        delete values[key]
      }
    })
    if (Object.keys(extraData).length > 0) {
      values.extraData = extraData
    }
    if (isUpdate.value) {
      await MenuApi.update(values)
    }
    else {
      await MenuApi.create(values)
    }
    window.$message?.success?.(isUpdate.value ? '更新成功' : '创建成功')
    closeModal()
    emit('success')
  }
  finally {
    setModalProps({ loading: false })
  }
}
</script>

<template>
  <BasicModal
    :title="isUpdate ? '编辑菜单' : '新增菜单'"
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
