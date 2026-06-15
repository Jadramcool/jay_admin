<script setup lang="ts" name="FormEdit">
import type { GridProps } from 'naive-ui'
import type { FormActionType, FormSchema } from './types'
import { isFunction } from '@/utils'
import FormItem from './components/FormItem.vue'
import { useBaseForm } from './hooks/useBaseForm'

defineOptions({ name: 'FormEdit' })

const props = defineProps({
  /** Schema 配置数组 */
  schemas: { type: Array as PropType<FormSchema[]>, default: () => [] },
  /** NGrid 配置 */
  gridProps: {
    type: Object as PropType<GridProps>,
    default: () => ({ cols: 1 }),
  },
  /** 每个表单项的 NGi 默认配置 */
  giProps: { type: Object, default: null },
  /** 标签宽度 */
  labelWidth: { type: [Number, String], default: 'auto' },
  /** 标签对齐 */
  labelAlign: { type: String, default: 'right' },
  /** 标签位置 */
  labelPlacement: { type: String, default: 'left' },
  /** 尺寸 */
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  /** 布局 */
  layout: { type: String, default: 'horizontal' },
  /** 组件是否撑满 */
  isFull: { type: Boolean, default: true },
  /** 是否显示操作按钮组（设为 false 时忽略 showSubmitButton / showResetButton） */
  showActionButtonGroup: { type: Boolean, default: true },
  /** 是否显示提交按钮 */
  showSubmitButton: { type: Boolean, default: true },
  /** 是否显示重置按钮 */
  showResetButton: { type: Boolean, default: false },
  /** 提交按钮文字 */
  submitButtonText: { type: String, default: '保存' },
  /** 重置按钮文字 */
  resetButtonText: { type: String, default: '重置' },
  /** 自定义提交函数（优先级高于 emit submit） */
  submitFunc: {
    type: Function as PropType<() => Promise<void>>,
    default: null,
  },
  /** 自定义重置函数 */
  resetFunc: { type: Function as PropType<() => Promise<void>>, default: null },
  /** 提交按钮 loading */
  loadingSub: { type: Boolean, default: false },
})

const emit = defineEmits<{
  register: [action: FormActionType]
  submit: [values: Recordable]
  reset: [values: Recordable]
}>()

const {
  formModel,
  formElRef,
  defaultFormModel,
  getProps,
  getSchema,
  getShow,
  componentPropsMap,
  setProps,
  setComponentRef,
  validate,
  clearValidate,
  updateSchema: baseUpdateSchema,
  getComponentInstance,
} = useBaseForm(props)

// ---------- bind value — 剔除表单自有 props ----------

const getBindValue = computed(() => {
  const {
    schemas,
    gridProps,
    giProps,
    showActionButtonGroup,
    showSubmitButton,
    showResetButton,
    submitButtonText,
    resetButtonText,
    submitFunc,
    resetFunc,
    loadingSub,
    ...rest
  } = unref(getProps)
  return rest
})

// ---------- grid ----------

const getGrid = computed((): GridProps => {
  return { ...unref(getProps).gridProps, responsive: 'screen' } as GridProps
})

// ---------- 表单操作 ----------

/** getFieldsValue 返回原始 formModel（无 query 格式化） */
function getFieldsValue(): Recordable {
  return toRaw(unref(formModel))
}

async function setFieldsValue(values: Recordable): Promise<void> {
  const schemas = unref(getSchema) || []
  const fields = schemas.map(item => item.field).filter(Boolean)
  Object.keys(values).forEach((key) => {
    if (fields.includes(key)) {
      formModel[key] = values[key]
    }
  })
}

function resetFields() {
  const { resetFunc: customReset } = unref(getProps)
  if (customReset && isFunction(customReset)) {
    customReset()
    return
  }
  const defaultModel = unref(defaultFormModel) || {}
  Object.keys(formModel).forEach((key) => {
    formModel[key] = defaultModel[key] ?? null
  })
  clearValidate()
  emit('reset', toRaw(formModel))
}

async function handleSubmit() {
  const { submitFunc: customSubmit } = unref(getProps)
  if (customSubmit && isFunction(customSubmit)) {
    await customSubmit()
    return
  }
  try {
    await validate()
    emit('submit', getFieldsValue())
  }
  catch {
    /* validation failed */
  }
}

const submitBtnOptions = computed(() => ({
  size: props.size,
  type: 'primary' as const,
}))

const resetBtnOptions = computed(() => ({
  size: props.size,
}))

// ---------- 对外 API ----------

const formAction: FormActionType = {
  getFieldsValue: getFieldsValue as <T = Recordable>() => T,
  setFieldsValue,
  setProps,
  resetFields,
  validate,
  validateFields: ((name?: string | string[]) => {
    return (unref(formElRef) as any)?.validate(
      (errors: any) => {
        if (errors)
          console.error(errors)
      },
      (rule: any) => {
        if (name && isArray(name))
          return name.includes(rule?.key as string)
        return rule?.key === name
      },
    )
  }) as any,
  clearValidate,
  submit: handleSubmit as any,
  updateSchema: baseUpdateSchema,
  getComponentInstance,
}

onMounted(() => {
  emit('register', formAction)
})

defineExpose(formAction)
</script>

<template>
  <NForm v-bind="getBindValue" ref="formElRef" :model="formModel">
    <NGrid v-bind="getGrid">
      <template v-for="schema in getSchema" :key="schema.field">
        <NGi v-if="getShow(schema)" v-bind="schema.giProps">
          <FormItem
            v-model:form-model="formModel"
            :schema="schema"
            :component-props-map="componentPropsMap"
            :is-full="getProps.isFull"
            @set-ref="setComponentRef"
          />
        </NGi>
      </template>
      <NGi v-if="getProps.showActionButtonGroup && (showSubmitButton || showResetButton)" :span="24">
        <n-space align="center" justify="center">
          <n-button
            v-if="showSubmitButton"
            v-bind="submitBtnOptions"
            :loading="loadingSub"
            @click="handleSubmit"
          >
            {{ submitButtonText }}
          </n-button>
          <n-button
            v-if="showResetButton"
            v-bind="resetBtnOptions"
            @click="resetFields"
          >
            {{ resetButtonText }}
          </n-button>
        </n-space>
      </NGi>
    </NGrid>
  </NForm>
</template>
