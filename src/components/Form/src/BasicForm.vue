<script setup lang="ts" name="BasicForm">
import type { GridProps } from 'naive-ui'
import type { FormActionType, FormSchema } from './types'
import { merge } from 'lodash-es'
import { isArray, isBoolean, isFunction } from '@/utils'
import FormItem from './components/FormItem.vue'
import { createPlaceholderMessage } from './helper'
import { useFormEvents, useFormValues } from './hooks'
import { formProps } from './props'

defineOptions({ name: 'BasicForm' })

const props = defineProps(formProps)
const emit = defineEmits<{
  register: [action: FormActionType]
  submit: [values: Recordable]
  reset: [values: Recordable]
}>()

// ---------- 核心响应式状态 ----------
/** 默认值快照 — 重置时还原到此状态 */
const defaultFormModel = shallowRef<Recordable>({})
/** 真正的表单数据，v-model 绑定到每一个 FormItem */
const formModel = reactive<Recordable>({})
/** Naive UI n-form 的 ref，用于调用 validate/restoreValidation */
const formElRef = shallowRef<Nullable<FormActionType>>(null)
/** 通过 setProps 动态合并进来的 props（优先级高于静态 props） */
const propsRef = shallowRef<Partial<any>>({})
/** 通过 updateSchema 动态更新后的 schema 列表（与 props.schemas 二选一） */
const schemaRef = shallowRef<Nullable<FormSchema[]>>(null)
/** inline 模式下是否折叠 */
const gridCollapsed = shallowRef(false)
/** 是否展开 */
const isExpand = computed(() => !gridCollapsed.value)
/** 提交按钮 loading 状态 */
const loadingSub = shallowRef(false)
/** 是否已初始化默认值（避免重复初始化覆盖用户输入） */
const isUpdateDefault = shallowRef(false)

/**
 * 最终合并的 props：静态 defineProps + 运行时 setProps 覆盖。
 * 同时为每个有 rules 的 schema 注入 key 字段（Naive UI 校验规则要求关联字段名）。
 */
const getProps = computed((): any => {
  const formProps = merge({}, props, unref(propsRef))
  const rulesObj: Recordable = { rules: {} }
  const schemas: FormSchema[] = formProps.schemas || []
  schemas.forEach((item) => {
    if (item.rules && isArray(item.rules)) {
      (item.rules as any[]).forEach((rule: any) => {
        rule.key = item.field
      })
      rulesObj.rules[item.field] = item.rules
    }
  })
  return { ...formProps, ...rulesObj }
})

/**
 * 从 getProps 中剔除表单自身消费的属性（schemas, gridProps, 按钮配置等），
 * 剩下的（rules, layout, labelAlign 等）通过 v-bind 透传给 NForm。
 */
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
    tableRef,
    submitOnReset,
    resetPageOnReset,
    showAdvancedButton,
    resetButtonOptions,
    submitButtonOptions,
    ...rest
  } = unref(getProps)
  return rest
})

/**
 * 获取当前 schema 列表。
 * 优先取 schemaRef（调用 updateSchema 动态更新后使用此路径），
 * 否则从 getProps.schemas 读取。
 */
const getSchema = computed((): FormSchema[] => {
  return unref(schemaRef) || (unref(getProps).schemas as any) || []
})

/** 收集所有 FormItem 子组件的 ref，用于 getComponentInstance */
const componentInstances: Recordable = {}

function setComponentRef(field: string, el: any) {
  if (el)
    componentInstances[field] = el
}

const { handleFormatFormValues, initDefaultFormModel } = useFormValues({
  defaultFormModel,
  getSchema,
  formModel,
})

const {
  handleSubmit,
  resetFields,
  getFieldsValue,
  validate,
  clearValidate,
  setFieldsValue,
  updateSchema,
  validateFields,
} = useFormEvents({
  emit,
  getProps,
  getSchema,
  formModel,
  formElRef,
  schemaRef: schemaRef as Ref<FormSchema[]>,
  loadingSub,
  defaultFormModel,
  handleFormatFormValues,
})

/**
 * 控制某个 schema 是否显示：
 * - ifShow 为布尔 → 直接决定
 * - ifShow 为函数 → 接收当前表单值 + schema，动态判断
 * - 未定义 → 始终显示
 */
function getShow(schema: FormSchema): boolean {
  const { ifShow } = schema
  if (ifShow === undefined)
    return true
  if (isBoolean(ifShow))
    return ifShow
  if (isFunction(ifShow)) {
    return ifShow({ values: { ...getFieldsValue() }, schema })
  }
  return true
}

/**
 * 预计算每个 schema 的 componentProps（支持函数形式），
 * 并注入默认 placeholder。FormItem 通过 schema.field 查表拿到自己的 props。
 */
const componentPropsMap = computed(() => {
  const schemaArray = unref(getSchema) || []
  return schemaArray.reduce((acc, schema: any) => {
    const props = getComponentProps(schema)
    if (props !== undefined && typeof props === 'object') {
      acc[schema.field] = props
    }
    return acc
  }, {} as Recordable)
})

function getComponentProps(schema: FormSchema): Recordable {
  let { componentProps = {} } = schema
  if (isFunction(componentProps)) {
    componentProps = componentProps({ schema, formModel }) ?? {}
  }

  /** 针对某些组件的默认 props，schema 中显式设置 undefined 或 false 可覆盖 */
  const defaultComponentProps: Recordable = {
    placeholder: createPlaceholderMessage(schema.component),
  }

  if (
    schema.component === 'NSelect'
    || schema.component === 'NInput'
    || schema.component === 'NDatePicker'
    || schema.component === 'NTimePicker'
    || schema.component === 'ApiSelect'
  ) {
    if (!Reflect.has(componentProps, 'clearable')) {
      defaultComponentProps.clearable = true
    }
  }

  return {
    ...defaultComponentProps,
    ...componentProps,
  }
}

/** 对外暴露的 setProps：合并入 propsRef，getProps 重新计算时会自动覆盖 */
async function setProps(formProps: Partial<any>): Promise<void> {
  propsRef.value = merge({}, unref(propsRef) || {}, formProps)
}

const isInline = computed(() => unref(getProps).layout === 'inline')

/** NGrid 配置：inline 模式下支持折叠 */
const getGrid = computed((): GridProps => {
  const { gridProps } = unref(getProps)
  return {
    ...gridProps,
    collapsed: isInline.value ? unref(gridCollapsed) : false,
    responsive: 'screen',
  } as GridProps
})

const getSubmitBtnOptions = computed(() => ({
  size: props.size,
  type: 'primary',
  ...props.submitButtonOptions,
}))

const getResetBtnOptions = computed(() => ({
  size: props.size,
  ...props.resetButtonOptions,
}))

/** inline 模式下切换展开/收起 */
function unfoldToggle() {
  gridCollapsed.value = !gridCollapsed.value
}

const getComponentInstance = (field: string) => componentInstances[field]

/**
 * 监听 schema 首次加载，初始化默认值到 formModel 与 defaultFormModel。
 * 之后再变化（比如 updateSchema）不会重新初始化，避免覆盖用户已输入的值。
 */
watch(
  () => unref(getSchema),
  (schema: FormSchema[]) => {
    if (!unref(isUpdateDefault) && schema?.length) {
      initDefaultFormModel()
      isUpdateDefault.value = true
    }
  },
)

/** 对外命令式 API — 与 useForm 返回的 methods 一一对应 */
const formAction: FormActionType = {
  getFieldsValue: getFieldsValue as <T = Recordable>() => T,
  setFieldsValue,
  setProps,
  resetFields,
  validate,
  validateFields: validateFields as (name: string | string[]) => Promise<any>,
  clearValidate,
  submit: handleSubmit as any,
  updateSchema,
  getComponentInstance,
}

/** 挂载时将 API 注册给父组件（即 useForm 的 register 回调） */
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
      <NGi
        v-if="getProps.showActionButtonGroup"
        :span="isInline ? undefined : 24"
        :suffix="isInline ? true : false"
      >
        <n-space align="center" :justify="isInline ? 'end' : 'start'">
          <n-button
            v-if="getProps.showSubmitButton"
            v-bind="getSubmitBtnOptions"
            :loading="loadingSub"
            @click="handleSubmit"
          >
            {{ getProps.submitButtonText || "查询" }}
          </n-button>
          <n-button
            v-if="getProps.showResetButton"
            v-bind="getResetBtnOptions"
            @click="resetFields"
          >
            {{ getProps.resetButtonText || "重置" }}
          </n-button>
          <n-button
            v-if="
              isInline && getProps.showAdvancedButton && getSchema.length > 3
            "
            type="primary"
            text
            icon-placement="right"
            @click="unfoldToggle"
          >
            {{ isExpand ? "收起" : "展开" }}
          </n-button>
        </n-space>
      </NGi>
    </NGrid>
  </NForm>
</template>

<style lang="scss" scoped>
.isFull {
  width: 100%;
  justify-content: flex-start;
}
</style>
