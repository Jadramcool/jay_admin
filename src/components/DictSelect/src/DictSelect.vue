<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useDictStore } from '@/store/modules'

/**
 * 通用字典下拉组件
 *
 * 按字典类型编码(code)加载选项,选项数据来自字典缓存 store。
 * 用法:<DictSelect v-model:value="sex" code="sex" />
 */
const props = withDefaults(defineProps<{
  /** 字典类型编码,如 sex */
  code: string
  value?: string | number | null | Array<string | number>
  multiple?: boolean
  clearable?: boolean
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}>(), {
  value: null,
  multiple: false,
  clearable: true,
  placeholder: '请选择',
  disabled: false,
  size: 'medium',
})

const emit = defineEmits<{
  'update:value': [value: any]
}>()

const dictStore = useDictStore()

const options = computed(() =>
  dictStore.getOptions(props.code).map(item => ({ label: item.label, value: item.code })),
)

async function load() {
  if (props.code)
    await dictStore.getItems(props.code)
}

onMounted(load)
watch(() => props.code, load)
</script>

<template>
  <n-select
    :value="value"
    :options="options"
    :multiple="multiple"
    :clearable="clearable"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    @update:value="emit('update:value', $event)"
  />
</template>
