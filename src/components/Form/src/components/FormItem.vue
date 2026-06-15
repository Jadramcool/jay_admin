<script setup lang="ts" name="FormItem">
import type { FormSchema } from '../types'
import { NCheckboxGroup, NRadio } from 'naive-ui'
import { componentMap } from '../componentMap'

const props = withDefaults(defineProps<Props>(), { isFull: true })

const emit = defineEmits<{ setRef: [field: string, el: any] }>()

defineSlots<{ [key: string]: any }>()

interface Props {
  /** 当前字段的 schema 配置 */
  schema: FormSchema
  /** 预计算好的 { [field]: componentProps } 映射表，由 BasicForm 传入 */
  componentPropsMap: Recordable
  /** 组件是否撑满宽度 */
  isFull?: boolean
}

/**
 * defineModel('formModel') — 双向绑定父组件的 formModel。
 * 子组件通过 formModel[schema.field] 读写当前字段的值。
 */
const formModel = defineModel<Recordable>('formModel', { default: () => ({}) })

/** 从预计算表中查找当前字段的组件 props */
const componentProps = computed(
  () => props.componentPropsMap[props.schema.field],
)

/** 向父级注册组件实例引用 */
function setRef(el: any) {
  emit('setRef', props.schema.field, el)
}
</script>

<template>
  <!-- NFormItemGi：Naive UI 的表单项容器，带 label 和校验提示 -->
  <n-form-item :label="schema.label" :path="schema.field">
    <!-- 如果有 labelMessage，显示 tooltip 图标 -->
    <template v-if="schema.labelMessage" #label>
      {{ schema.label }}
      <n-tooltip trigger="hover" :style="schema.labelMessageStyle">
        <template #trigger>
          <n-icon size="14">
            <n-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"
                /></svg>
            </n-icon>
          </n-icon>
        </template>
        {{ schema.labelMessage }}
      </n-tooltip>
    </template>

    <!--
      组件派发逻辑（按优先级）：
      1. NRadioGroup — 特殊处理，内部需渲染多个 n-radio
      2. NCheckboxGroup — 同上
      3. componentMap 中的组件 — 动态渲染（NInput、NSelect、ApiSelect 等）
      4. 具名 slot — 完全由父组件自定义
    -->

    <n-radio-group
      v-if="schema.component === 'NRadioGroup'"
      v-bind="componentProps"
      :ref="setRef"
      :value="formModel[schema.field]"
      @update:value="
        (v: any) => {
          formModel[schema.field] = v;
        }
      "
    >
      <NRadio
        v-for="option in componentProps?.options ?? []"
        :key="option.value"
        :value="option.value"
        :label="option.label"
      />
    </n-radio-group>

    <NCheckboxGroup
      v-else-if="schema.component === 'NCheckboxGroup'"
      v-bind="componentProps"
      :ref="setRef"
      :value="formModel[schema.field]"
      @update:value="
        (v: any) => {
          formModel[schema.field] = v;
        }
      "
    >
      <n-checkbox
        v-for="option in componentProps?.options ?? []"
        :key="option.value"
        :value="option.value"
        :label="option.label"
      />
    </NCheckboxGroup>

    <!-- 动态组件：从 componentMap 查询 → component :is 渲染 -->
    <component
      :is="componentMap.get(schema.component)"
      v-else-if="schema.component && componentMap.has(schema.component)"
      v-bind="componentProps"
      :ref="setRef"
      :value="formModel[schema.field]"
      :class="{
        'is-full':
          schema.isFull !== false && isFull && schema.component !== 'NSwitch',
      }"
      @update:value="
        (v: any) => {
          formModel[schema.field] = v;
        }
      "
    />

    <!-- 具名 slot：用于完全自定义的字段渲染 -->
    <slot
      v-else-if="schema.slot && $slots[schema.slot]"
      :model="formModel"
      :field="schema.field"
      :schema="schema"
      :name="schema.slot"
    />
  </n-form-item>
</template>

<style lang="scss" scoped>
.is-full {
  width: 100%;
}
</style>
