<script setup lang="ts">
import { ref } from 'vue'
import { DepartmentApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useDepartmentSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const isUpdate = ref(false)
const { editFormSchemas } = useDepartmentSchema()

const [registerForm, { setFieldsValue, resetFields, validate, getFieldsValue }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data: any) => {
  resetFields()
  isUpdate.value = !!data?.isUpdate
  if (isUpdate.value) {
    setFieldsValue(data.record)
  }
  else if (data?.record?.parentId) {
    setFieldsValue({ parentId: data.record.parentId })
  }
})

async function handleOk() {
  try {
    await validate()
  }
  catch {
    return
  }
  setModalProps({ loading: true })
  try {
    const values = { ...getFieldsValue() }
    if (isUpdate.value) {
      await DepartmentApi.update(values)
    }
    else {
      await DepartmentApi.create(values)
    }
    window.$message?.success?.(isUpdate.value ? '更新成功' : '创建成功')
    closeModal()
    emit('success')
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    setModalProps({ loading: false })
  }
}
</script>

<template>
  <BasicModal
    :title="isUpdate ? '编辑部门' : '新增部门'"
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
