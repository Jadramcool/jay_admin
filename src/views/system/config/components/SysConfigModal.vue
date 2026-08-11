<script setup lang="ts">
import { shallowRef } from 'vue'
import { SysConfigApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { useSysConfigSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: unknown, uuid: number]
}>()

const isUpdate = shallowRef(false)
const { editFormSchemas } = useSysConfigSchema({
  handleDelete: () => {},
  handleEdit: () => {},
  handleTogglePublic: () => {},
})

const [registerForm, formMethods] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, modalMethods] = useModalInner(async (data: {
  isUpdate?: boolean
  record?: System.SysConfig
}) => {
  await formMethods.resetFields()
  isUpdate.value = Boolean(data?.isUpdate)
  if (data?.record)
    await formMethods.setFieldsValue(data.record)
})

async function handleOk() {
  try {
    await formMethods.validate()
  }
  catch {
    return
  }

  modalMethods.setModalProps({ loading: true })
  try {
    const values = formMethods.getFieldsValue<Partial<System.SysConfig>>()
    if (isUpdate.value && values.id) {
      await SysConfigApi.update({ ...values, id: Number(values.id) })
    }
    else {
      await SysConfigApi.create(values)
    }
    window.$message?.success?.(isUpdate.value ? '更新成功' : '创建成功')
    modalMethods.closeModal()
    emit('success')
  }
  catch {
    // 全局请求层已提供安全错误提示。
  }
  finally {
    modalMethods.setModalProps({ loading: false })
  }
}
</script>

<template>
  <BasicModal
    :title="isUpdate ? '编辑系统配置' : '新增系统配置'"
    draggable
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
