<template>
  <n-descriptions
    v-bind="$props"
    :columns="descriptionColumns"
    :column="column"
    :label-placement="labelPlacement"
    :label-width="labelWidth"
    :size="size"
    :bordered="bordered">
    <n-descriptions-item
      v-for="item in renderItems"
      :key="item.field"
      :label="item.label"
      :span="item.span || 1">
      <template v-if="item.render">
        <component :is="item.render" v-bind="data" />
      </template>
      <template v-else>
        {{ data ? (data[item.field] ?? "-") : "-" }}
      </template>
    </n-descriptions-item>
  </n-descriptions>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DescriptionProps } from "naive-ui";

interface DescriptionItem {
  field: string;
  label: string;
  span?: number;
  render?: (data: any) => any;
}

interface Props extends /* @vue-ignore */ DescriptionProps {
  schemas: DescriptionItem[];
  data: Recordable;
  column?: number;
  labelPlacement?: "top" | "left";
  labelWidth?: number | string;
  size?: "small" | "medium" | "large";
  bordered?: boolean;
  descriptionColumns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  schemas: () => [],
  data: () => ({}),
  column: 3,
  labelPlacement: "left",
  labelWidth: 100,
  size: "small",
  bordered: false,
  descriptionColumns: 3,
});

const renderItems = computed(() => {
  return props.schemas.filter((item) => item.field);
});
</script>

