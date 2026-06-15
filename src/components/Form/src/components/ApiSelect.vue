<template>
  <n-select
    v-bind="getBindValue"
    :value="value"
    :loading="loading"
    :options="options"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  value: { type: [Array, String, Number] as PropType<string | number | (string | number)[] | null>, default: null },
  api: { type: Function, default: null },
  params: { type: Object, default: () => ({}) },
  labelField: { type: String, default: 'name' },
  valueField: { type: String, default: 'id' },
  immediate: { type: Boolean, default: true },
  resultField: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
});

const emit = defineEmits(['update:value']);

const loading = ref(false);
const options = ref<any[]>([]);

const getBindValue = computed(() => {
  const { api, params, labelField, valueField, immediate, resultField, ...rest } = props;
  return rest;
});

async function loadData() {
  if (!props.api) return;
  loading.value = true;
  try {
    const result = await props.api(props.params);
    const data = props.resultField ? result[props.resultField] : result;
    if (Array.isArray(data)) {
      options.value = data.map((item: any) => ({
        label: item[props.labelField],
        value: item[props.valueField],
      }));
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function handleChange(val: any) {
  emit('update:value', val);
}

onMounted(() => {
  if (props.immediate) loadData();
});

watch(() => props.params, loadData, { deep: true });
</script>
