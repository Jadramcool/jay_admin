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
  if (data?.record) {
    await formMethods.setFieldsValue(data.record)
    // 按配置类型切换 value 输入控件(类型化编辑)
    await applyValueControl(data.record.type)
  }
})

/** 按类型动态调整 value 字段控件 */
async function applyValueControl(type?: string) {
  const t = type ?? 'STRING'
  const schema: Record<string, unknown> = { field: 'value' }
  if (t === 'NUMBER') {
    schema.component = 'NInputNumber'
    schema.componentProps = { placeholder: '请输入数字', style: 'width: 100%' }
  }
  else if (t === 'BOOLEAN') {
    schema.component = 'NSelect'
    schema.componentProps = {
      placeholder: '请选择',
      options: [
        { label: 'true', value: 'true' },
        { label: 'false', value: 'false' },
      ],
    }
  }
  else if (t === 'JSON' || t === 'ARRAY') {
    schema.component = 'NInput'
    schema.componentProps = { type: 'textarea', placeholder: '请输入合法 JSON', rows: 4 }
  }
  else if (t === 'PASSWORD') {
    schema.component = 'NInput'
    schema.componentProps = { type: 'password', showPasswordOn: 'click', placeholder: '留空则不修改' }
    // 编辑时留空表示不修改,不做必填校验
    schema.rules = []
  }
  else {
    schema.component = 'NInput'
    schema.componentProps = { placeholder: '请输入配置值' }
  }
  await formMethods.updateSchema([schema])
}

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
    // PASSWORD 脱敏回显:留空表示不修改(编辑时不提交 value)
    if (isUpdate.value && values.value === '******')
      delete values.value
    // NUMBER/BOOLEAN 等控件返回非字符串,统一序列化
    if (values.value !== undefined && typeof values.value !== 'string')
      values.value = String(values.value)
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
