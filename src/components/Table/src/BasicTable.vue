<script setup lang="ts" name="BasicTable">
import type { VNodeChild } from 'vue'
import { NCard, NDataTable, NEmpty } from 'naive-ui'
import { computed, h, ref, unref, watch } from 'vue'
import { JIcon } from '@/components'
import { useComponentTableStore } from '@/store/modules'
import { ToolBar } from './components'
import { useColumns, useDataSource, useLoading, usePagination } from './hooks'
import { basicProps } from './props'

defineOptions({ name: 'BasicTable' })

const props = defineProps(basicProps)

const emit = defineEmits<{
  'add': []
  'batchDelete': [keys: any[]]
  'update:checkedRowKeys': [keys: any[]]
}>()

defineSlots<{
  'header'?: unknown
  'header-extra'?: unknown
  'toolbar'?: unknown
  'card-footer'?: unknown
  'empty'?: unknown
  'loading'?: unknown
}>()

const componentTableStore = useComponentTableStore()

const customProps = computed(() => ({
  size: componentTableStore.size,
}))

const getProps: any = computed(() => {
  const cardTitle = props.title || ''
  const newProps = { ...props } as Record<string, any>
  delete newProps.title
  return {
    ...newProps,
    ...customProps.value,
    cardTitle,
  }
})

const { columnChecks, getColumns, resetColumns } = useColumns(getProps)
const { getLoading, setLoading } = useLoading(getProps)
const { getPaginationInfo, setPagination } = usePagination(getProps)

const pagination = computed(() => unref(getPaginationInfo))

const { dataSourceRef, reload, handleLocalPagination, fullDataSourceRef }
  = useDataSource(getProps, {
    getPaginationInfo,
    setPagination,
    setLoading,
  })

const checkedRowKeys = ref<any[]>([])
const expandedRowKeys = ref<any[]>([])

const getTableValue: any = computed(() => ({
  ...unref(getProps),
  data: unref(dataSourceRef),
  columns: unref(getColumns),
  pagination: pagination.value,
  loading: unref(getLoading),
  rowKey: unref(getProps).rowKey,
  remote: true,
  expandedRowKeys: unref(expandedRowKeys),
}))

function updatePage(page: any) {
  setPagination({ page })
  if (!unref(getProps).localPagination) {
    reload(page)
  }
  else {
    dataSourceRef.value = handleLocalPagination(fullDataSourceRef.value)
  }
}

function updatePageSize(size: any) {
  setPagination({ page: 1, pageSize: size })
  if (!unref(getProps).localPagination) {
    reload({})
  }
  else {
    dataSourceRef.value = handleLocalPagination(fullDataSourceRef.value)
  }
}

async function handleRefresh() {
  await reload()
}

function handleAdd() {
  emit('add')
}

function handleBatchDelete() {
  emit('batchDelete', checkedRowKeys.value)
}

function handleCheckChange(keys: any[]) {
  checkedRowKeys.value = keys
  emit('update:checkedRowKeys', keys)
}

function handleExpandedChange(keys: any[]) {
  expandedRowKeys.value = keys
}

function renderExpandIcon({ expanded }: { expanded: boolean }): VNodeChild {
  return h(JIcon, {
    icon: 'tabler:chevron-right',
    size: 16,
    class: [
      'transition-all',
      'duration-300',
      'ease-in-out',
      {
        'rotate-90': expanded,
      },
    ],
  })
}

watch(
  () => getProps.value.data,
  (val: any) => {
    if (val && val.length) {
      dataSourceRef.value = val
    }
  },
  { deep: true, immediate: true },
)

// 数据加载后自动展开所有行（defaultExpandAll）
watch(dataSourceRef, (val: any) => {
  if (!val?.length)
    return
  if (!unref(getProps).defaultExpandAll)
    return
  const rowKey = unref(getProps).rowKey
  const extractIds = (items: any[]): any[] =>
    items.flatMap((item: any) => [
      typeof rowKey === 'function' ? rowKey(item) : item[rowKey || 'id'],
      ...extractIds(item.children || []),
    ])
  expandedRowKeys.value = extractIds(val)
})

defineExpose({
  reload,
  setPagination,
})
</script>

<template>
  <NCard :bordered="false" size="small" class="table-wrapper">
    <template #header>
      <slot name="header">
        <p v-if="getProps.showToolbar" class="card-header">
          {{ getProps.cardTitle }}
        </p>
      </slot>
    </template>
    <template #header-extra>
      <ToolBar
        v-if="getProps.showToolbar"
        v-model:columns="columnChecks"
        :show-add-btn="getProps.showAddBtn"
        :show-batch-delete-btn="getProps.showBatchDeleteBtn"
        :show-columns-setting="getProps.showColumnsSetting"
        @reset-columns="resetColumns"
        @refresh="handleRefresh"
        @add="handleAdd"
        @batch-delete="handleBatchDelete"
      >
        <slot name="toolbar" />
      </ToolBar>
      <slot name="header-extra" />
    </template>
    <template #footer>
      <slot name="card-footer" />
    </template>

    <NDataTable
      v-bind="getTableValue"
      :bordered="false"
      :class="{ 'header-no-wrap': getProps.headerNoWrap }"
      :render-expand-icon="renderExpandIcon"
      @update:page="updatePage"
      @update:page-size="updatePageSize"
      @update:checked-row-keys="handleCheckChange"
      @update:expanded-row-keys="handleExpandedChange"
    >
      <template #empty>
        <slot name="empty">
          <NEmpty description="暂无数据" />
        </slot>
      </template>
      <template #loading>
        <slot name="loading" />
      </template>
    </NDataTable>
  </NCard>
</template>

<style lang="scss" scoped></style>
