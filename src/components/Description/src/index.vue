<script setup lang="ts">
import type { DescriptionProps } from 'naive-ui'
import { computed } from 'vue'

interface DescriptionItem {
  field: string
  label: string
  span?: number
  labelBold?: boolean
  valueBold?: boolean
  render?: (data: any) => any
}

interface Props extends /* @vue-ignore */ DescriptionProps {
  schemas?: DescriptionItem[]
  data?: Recordable
  column?: number
  labelPlacement?: 'top' | 'left'
  labelWidth?: number | string
  size?: 'small' | 'medium' | 'large'
  bordered?: boolean
  descriptionColumns?: number
}

const props = withDefaults(defineProps<Props>(), {
  schemas: () => [],
  data: () => ({}),
  column: 3,
  labelPlacement: 'left',
  labelWidth: 100,
  size: 'small',
  bordered: false,
  descriptionColumns: 3,
})

const renderItems = computed(() => {
  return props.schemas.filter(item => item.field)
})
</script>

<template>
  <n-descriptions
    v-bind="$props"
    :columns="descriptionColumns"
    :column="column"
    :label-placement="labelPlacement"
    :label-width="labelWidth"
    :size="size"
    :bordered="bordered"
  >
    <n-descriptions-item
      v-for="item in renderItems"
      :key="item.field"
      :span="item.span || 1"
    >
      <template #label>
        <span :style="item.labelBold ? 'font-weight: 600;' : ''">{{
          item.label
        }}</span>
      </template>
      <template v-if="item.render">
        <span :style="item.valueBold ? 'font-weight: 600;' : ''">
          <component :is="item.render" v-bind="data" />
        </span>
      </template>
      <template v-else>
        <span :style="item.valueBold ? 'font-weight: 600;' : ''">{{
          data ? (data[item.field] ?? "-") : "-"
        }}</span>
      </template>
    </n-descriptions-item>
  </n-descriptions>
</template>
