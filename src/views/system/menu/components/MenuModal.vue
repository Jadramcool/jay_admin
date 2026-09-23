<script setup lang="ts">
import type { MenuTypeValue } from '../menu-tree'
import { ref } from 'vue'
import { MenuApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { buildMenuPayload } from '../menu-tree'
import { useMenuSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const isUpdate = ref(false)
const editingId = ref<number | null>(null)
/** 原始 extraData：表单只编辑其中 withContentCard，其余键原样保留 */
const originalExtraData = ref<Record<string, any>>({})

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
    originalExtraData.value = {}
    if (isUpdate.value) {
      editingId.value = data.record.id
      const record = { ...data.record }
      // 从 extraData JSON 中提取虚拟字段
      if (record.extraData && typeof record.extraData === 'object') {
        originalExtraData.value = { ...record.extraData } as Record<string, any>
        Object.assign(record, record.extraData)
      }
      else if (typeof record.extraData === 'string') {
        try {
          const parsed = JSON.parse(record.extraData)
          originalExtraData.value = { ...parsed }
          Object.assign(record, parsed)
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

  const formValues = { ...getFieldsValue() }
  const type = formValues.type as MenuTypeValue

  // 按钮行是接口鉴权的唯一载体：权限码必填，且必须挂在菜单页面下
  if (type === 'BUTTON') {
    if (!String(formValues.permission ?? '').trim()) {
      window.$message?.error?.('按钮必须填写权限标识（与接口声明的权限码一致）')
      return
    }
    if (formValues.pid === null || formValues.pid === undefined) {
      window.$message?.error?.('按钮必须挂在某个菜单下，请选择所属菜单')
      return
    }
  }

  // 按类型裁剪负载：隐藏字段不落库，可空字段显式置 null
  const values = buildMenuPayload(formValues, type)

  // withContentCard 是虚拟字段，序列化回 extraData；按钮不使用该字段
  if (type !== 'BUTTON') {
    values.extraData = {
      ...originalExtraData.value,
      withContentCard: formValues.withContentCard !== false,
    }
  }

  setModalProps({ loading: true })
  try {
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
