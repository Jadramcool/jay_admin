<script setup lang="ts">
import { ref } from 'vue'
import { RoleApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useRoleSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const isUpdate = ref(false)
const { editFormSchemas } = useRoleSchema()

const [registerForm, { setFieldsValue, resetFields, validate, getFieldsValue }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data: any) => {
  resetFields()
  isUpdate.value = !!data?.isUpdate
  if (isUpdate.value)
    setFieldsValue(data.record)
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
      await RoleApi.update(values)
    }
    else {
      await RoleApi.create(values)
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
    :title="isUpdate ? '编辑角色' : '新增角色'"
    draggable
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
