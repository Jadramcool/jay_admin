<script setup lang="ts">
import type { ControlMeta } from '../typeLabels'
import { isEqual } from 'lodash-es'
import { computed, ref } from 'vue'
import { SettingsApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { invalidatePublicSettings } from '@/composables/usePublicSettings'
import { useSettingEditSchema } from '../schema'
import { EXPOSE_TEXT, SOURCE_TEXT, TYPE_TEXT } from '../typeLabels'
import SettingControl from './SettingControl.vue'

/**
 * 编辑单个设置项。
 *
 * 表单字段(设置值 / 变更原因)声明在 ../schema 的 `editForm` 里,这里只负责:
 *   1. 打开时把当前值灌进表单;
 *   2. 用 `settingValue` 插槽渲染随注册表类型变化的控件(SettingControl);
 *   3. 提交走乐观锁(expectedVersion),并发冲突由后端返回 409、http 层统一提示。
 */
export interface SettingModalData {
  row: System.SettingView
  meta?: ControlMeta
}

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const row = ref<System.SettingView | null>(null)
const meta = ref<ControlMeta | null>(null)
const submitting = ref(false)

const { editFormSchemas } = useSettingEditSchema()
const [registerForm, { setFieldsValue, getFieldsValue, validate }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const [registerModal, { closeModal, setModalProps }] = useModalInner(
  async (data: SettingModalData) => {
    row.value = data?.row ?? null
    meta.value = data?.meta ?? null
    await setFieldsValue({
      value: row.value?.value ?? '',
      reason: '',
    })
  },
)

const readonly = computed(
  () => !row.value || row.value.source === 'env' || row.value.expose === 'secret',
)

/** 值控件的声明元数据:注册表项(约束/字典) + 当前行的来源与只读态 */
const controlMeta = computed<ControlMeta>(() => ({
  ...meta.value,
  type: meta.value?.type ?? row.value?.type ?? 'string',
  source: row.value?.source ?? 'db',
  readonly: readonly.value,
}))

const dirty = computed(
  () => Boolean(row.value) && !isEqual(getFieldsValue().value, row.value?.value),
)

const defaultValueText = computed(() => {
  const value = row.value?.defaultValue
  if (value === null || value === undefined || value === '')
    return '-'
  if (typeof value === 'object')
    return JSON.stringify(value)
  if (typeof value === 'boolean')
    return value ? '是' : '否'
  return String(value)
})

async function handleOk() {
  if (!row.value)
    return
  if (readonly.value) {
    window.$message?.warning?.('该项由环境变量提供，不支持在线修改')
    return
  }
  if (!dirty.value) {
    window.$message?.info?.('未修改任何内容')
    closeModal()
    return
  }

  try {
    await validate()
  }
  catch {
    return
  }

  submitting.value = true
  setModalProps({ confirmLoading: true })
  try {
    const values = getFieldsValue<{ value: Api.SettingUpdateParams['value'], reason?: string }>()
    await SettingsApi.update(row.value.key, {
      value: values.value,
      expectedVersion: row.value.version || undefined,
      reason: values.reason || undefined,
    })
    // 公开设置缓存失效,布局/登录页下次进入即拿到新值
    invalidatePublicSettings()
    window.$message?.success?.('保存成功')
    emit('success')
    closeModal()
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    submitting.value = false
    setModalProps({ confirmLoading: false })
  }
}
</script>

<template>
  <BasicModal
    title="编辑设置"
    :width="640"
    :mask-closable="false"
    @register="registerModal"
    @ok="handleOk"
  >
    <n-descriptions
      v-if="row"
      bordered
      size="small"
      :column="2"
      label-placement="left"
    >
      <n-descriptions-item label="名称">
        {{ row.label }}
      </n-descriptions-item>
      <n-descriptions-item label="类型">
        {{ TYPE_TEXT[row.type] || row.type }}
      </n-descriptions-item>
      <n-descriptions-item label="键名">
        <code>{{ row.key }}</code>
      </n-descriptions-item>
      <n-descriptions-item label="分组">
        {{ row.group }}
      </n-descriptions-item>
      <n-descriptions-item label="可见性">
        {{ EXPOSE_TEXT[row.expose] || row.expose }}
      </n-descriptions-item>
      <n-descriptions-item label="来源">
        {{ SOURCE_TEXT[row.source] || row.source }}
      </n-descriptions-item>
      <n-descriptions-item label="默认值" :span="2">
        {{ defaultValueText }}
      </n-descriptions-item>
      <n-descriptions-item v-if="row.updatedTime" label="最近更新" :span="2">
        {{ row.updatedName || '系统' }} · v{{ row.version }} ·
        {{ row.updatedTime.replace('T', ' ').slice(0, 19) }}
      </n-descriptions-item>
    </n-descriptions>

    <div v-if="row?.description" class="mt-2 text-xs opacity-60">
      {{ row.description }}
    </div>

    <FormEdit class="mt-4" @register="registerForm">
      <!-- 值控件随注册表类型变化:由 schema 里 editForm.slot = 'settingValue' 声明 -->
      <template #settingValue="{ model }">
        <SettingControl
          :item="controlMeta"
          :value="model.value"
          :readonly="readonly"
          @update:value="value => (model.value = value)"
        />
      </template>
    </FormEdit>
  </BasicModal>
</template>
