<script setup lang="ts">
import type { ControlMeta } from '../typeLabels'
import { computed, ref, watch } from 'vue'
import { DictSelect } from '@/components/DictSelect'

/**
 * 单个设置项的值控件。
 *
 * 本地业务组件(放在设置页目录下,不做成公共组件):它的唯一职责是
 * 把注册表声明的 `type` 映射成 NaiveUI 控件,这是设置页的内部实现细节,
 * 其他页面不需要复用;分组/标签/校验约束仍然来自后端注册表。
 */
/** 与后端契约一致:设置值是动态联合类型 */
type SettingValue = Api.SettingUpdateParams['value']

const props = defineProps<{
  item: ControlMeta
  value: unknown
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: SettingValue]
}>()

const disabled = computed(() => props.readonly || props.item.readonly || props.item.source === 'env')
const stringValue = computed(() => (props.value === null || props.value === undefined ? '' : String(props.value)))

// json / string[] 用文本编辑:本地保存文本,能解析成合法 JSON 才回写草稿
const jsonText = ref('')
const jsonError = ref('')
watch(
  () => props.value,
  (value) => {
    jsonText.value = value === null || value === undefined ? '' : JSON.stringify(value, null, 2)
    jsonError.value = ''
  },
  { immediate: true },
)

function onJsonInput(text: string) {
  jsonText.value = text
  if (!text.trim()) {
    jsonError.value = ''
    emit('update:value', props.item.type === 'string[]' ? [] : {})
    return
  }
  try {
    emit('update:value', JSON.parse(text))
    jsonError.value = ''
  }
  catch {
    jsonError.value = 'JSON 格式不正确,保存前请修正'
  }
}

function onText(value: string) {
  emit('update:value', value)
}

/** 数字输入被清空时忽略(避免把 null 提交给后端) */
function onNumber(value: number | null) {
  if (value === null)
    return
  emit('update:value', value)
}
</script>

<template>
  <n-switch
    v-if="item.type === 'boolean'"
    :value="Boolean(value)"
    :disabled="disabled"
    @update:value="emit('update:value', $event)"
  />
  <n-input-number
    v-else-if="item.type === 'number'"
    :value="value as number"
    :min="item.min"
    :max="item.max"
    :disabled="disabled"
    :show-button="false"
    class="w-full max-w-60"
    @update:value="onNumber"
  />
  <n-color-picker
    v-else-if="item.type === 'color'"
    :value="stringValue"
    :disabled="disabled"
    :show-alpha="false"
    class="max-w-60"
    @update:value="emit('update:value', $event)"
  />
  <DictSelect
    v-else-if="item.type === 'select'"
    :code="item.dictCode!"
    :value="stringValue"
    :disabled="disabled"
    class="max-w-60"
    @update:value="emit('update:value', $event)"
  />
  <div v-else-if="item.type === 'json' || item.type === 'string[]'" class="w-full">
    <n-input
      type="textarea"
      :value="jsonText"
      :rows="3"
      :disabled="disabled"
      :status="jsonError ? 'error' : undefined"
      @update:value="onJsonInput"
    />
    <div v-if="jsonError" class="mt-1 text-xs text-red-500">
      {{ jsonError }}
    </div>
  </div>
  <n-input
    v-else
    :value="stringValue"
    :disabled="disabled"
    :maxlength="item.type === 'color' ? 9 : undefined"
    class="max-w-80"
    @update:value="onText"
  />
</template>
