<script setup lang="ts">
import type { MenuTypeValue } from '../menu-tree'
import { computed, ref } from 'vue'
import { MenuApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { DEFAULT_PLATFORM, platformLabel } from '@/constants'
import { buildMenuPayload } from '../menu-tree'
import { useMenuSchema } from '../schema'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const isUpdate = ref(false)
const editingId = ref<number | null>(null)
/** 本次操作的端：新增时跟随当前 Tab，编辑时沿用该行原有端 */
const platform = ref(DEFAULT_PLATFORM)
/** 原始 extraData：表单只编辑其中 withContentCard，其余键原样保留 */
const originalExtraData = ref<Record<string, any>>({})

const platformText = computed(() => platformLabel(platform.value))
const modalTitle = computed(() => isUpdate.value
  ? `编辑菜单 · ${platformText.value}`
  : `新增菜单 · ${platformText.value}`)

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
    // 端不在表单里编辑：由当前 Tab 决定，避免「在管理端 Tab 里把菜单改成 App 端」的边界态
    platform.value = data?.platform ?? data?.record?.platform ?? DEFAULT_PLATFORM
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

  // 新增时带上当前端；编辑时不动端（后端保留原值，跨端移动由菜单管理另行处理）
  if (!isUpdate.value) {
    values.platform = platform.value
  }

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
    :title="modalTitle"
    @register="registerModal"
    @ok="handleOk"
  >
    <FormEdit @register="registerForm" />
  </BasicModal>
</template>
