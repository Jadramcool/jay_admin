<template>
  <n-tree-select
    v-bind="getBindValue"
    :loading="loading"
    :options="options"
    :value="value"
    @update:value="handleChange" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  value: {
    type: [Array, String, Number] as PropType<
      string | number | (string | number)[] | null
    >,
    default: null,
  },
  api: { type: Function, default: null },
  params: { type: Object, default: () => ({}) },
  labelField: { type: String, default: "name" },
  keyField: { type: String, default: "id" },
  childrenField: { type: String, default: "children" },
  immediate: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
});

const emit = defineEmits(["update:value"]);

const loading = ref(false);
const options = ref<any[]>([]);

const getBindValue = computed(() => {
  const {
    api,
    params,
    labelField,
    keyField,
    childrenField,
    immediate,
    value,
    multiple,
    ...rest
  } = props;
  return rest;
});

async function loadData() {
  if (!props.api) return;
  loading.value = true;
  try {
    const result = await props.api(props.params);
    options.value = formatTree(result);
    console.log(
      "🚀 ~ loadData ~ options.value:",
      options.value,
      getBindValue.value,
    );
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function formatTree(data: any[]): any[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    key: item[props.keyField],
    label: item[props.labelField],
    children:
      item[props.childrenField] &&
      Array.isArray(item[props.childrenField]) &&
      item[props.childrenField].length > 0
        ? formatTree(item[props.childrenField])
        : undefined,
  }));
}

function handleChange(val: any) {
  console.log("🚀 ~ handleChange ~ val:", val);
  emit("update:value", val);
}

onMounted(() => {
  if (props.immediate) loadData();
});

watch(() => props.params, loadData, { deep: true });
</script>

