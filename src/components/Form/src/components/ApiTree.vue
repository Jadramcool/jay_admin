<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  checkedKeys: { type: Array as PropType<Array<string | number>>, default: () => [] },
  api: { type: Function, default: null },
  params: { type: Object, default: () => ({}) },
  labelField: { type: String, default: 'name' },
  keyField: { type: String, default: 'id' },
  childrenField: { type: String, default: 'children' },
})

const emit = defineEmits(['update:checkedKeys'])

const loading = ref(false)
const treeData = ref<any[]>([])

const getBindValue = computed(() => {
  const { api, params, labelField, keyField, childrenField, checkedKeys, ...rest } = props
  return rest
})

async function loadData() {
  if (!props.api)
    return
  loading.value = true
  try {
    const result = await props.api(props.params)
    treeData.value = formatTree(result)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loading.value = false
  }
}

function formatTree(data: any[]): any[] {
  if (!Array.isArray(data))
    return []
  return data.map(item => ({
    label: item[props.labelField],
    key: item[props.keyField],
    children: item[props.childrenField] ? formatTree(item[props.childrenField]) : undefined,
  }))
}

function handleCheck(keys: any[]) {
  emit('update:checkedKeys', keys)
}

onMounted(() => loadData())
</script>

<template>
  <n-tree
    v-bind="getBindValue"
    :data="treeData"
    :loading="loading"
    :checked-keys="checkedKeys"
    :default-expand-all="true"
    checkable
    @update:checked-keys="handleCheck"
  />
</template>
