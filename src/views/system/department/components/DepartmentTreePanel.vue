<script setup lang="ts">
import type { TreeOption } from 'naive-ui'
import type { DepartmentTreeNode } from '../types'
import { Icon } from '@iconify/vue'
import { NTag } from 'naive-ui'
import { shallowRef } from 'vue'
import { hasPermission } from '@/utils/common/hasPermission'

const props = defineProps<{
  data: DepartmentTreeNode[]
  error: string
  expandedKeys: number[]
  loading: boolean
  selectedKeys: number[]
}>()

const emit = defineEmits<{
  'add': []
  'retry': []
  'select': [departmentId: number]
  'update:expandedKeys': [keys: number[]]
}>()

const searchKeyword = shallowRef('')

function renderLabel({ option }: { option: TreeOption }) {
  const node = option as DepartmentTreeNode
  return h('div', { class: 'department-tree-node' }, [
    h('div', { class: 'department-tree-node__heading' }, [
      h('span', { class: 'tree-node-name text-sm' }, node.label),
      node.status === 0
        ? h(NTag, {
            bordered: false,
            class: 'department-tree-node__status',
            size: 'tiny',
            type: 'warning',
          }, { default: () => '已禁用' })
        : null,
    ]),
    h('span', { class: 'tree-node-code text-xs' }, node.code),
  ])
}

function handleSelect(keys: Array<string | number>) {
  const departmentId = Number(keys[0])
  if (Number.isInteger(departmentId))
    emit('select', departmentId)
}

function handleExpandedKeys(keys: Array<string | number>) {
  emit('update:expandedKeys', keys.map(Number).filter(Number.isInteger))
}
</script>

<template>
  <aside class="department-tree-panel" aria-label="部门结构">
    <header class="department-tree-panel__header">
      <h2 class="department-tree-panel__title text-base">
        部门结构
      </h2>
      <n-button
        v-if="hasPermission('system:department:create')"
        aria-label="新增部门"
        title="新增部门"
        size="small"
        circle
        type="primary"
        @click="emit('add')"
      >
        <template #icon>
          <Icon aria-hidden="true" icon="mdi:plus" width="16" />
        </template>
      </n-button>
    </header>

    <n-input
      v-model:value="searchKeyword"
      :input-props="{
        'aria-label': '搜索部门',
        'autocomplete': 'off',
        'name': 'department-search',
      }"
      placeholder="搜索部门…"
      clearable
      size="small"
      class="department-tree-panel__search"
    />

    <n-spin :show="props.loading" class="department-tree-panel__body">
      <div v-if="props.error" class="department-tree-panel__state" role="alert">
        <Icon aria-hidden="true" icon="mdi:cloud-alert-outline" width="40" />
        <span>{{ props.error }}</span>
        <n-button size="small" @click="emit('retry')">
          重新加载
        </n-button>
      </div>

      <div v-else-if="!props.loading && !props.data.length" class="department-tree-panel__state">
        <Icon aria-hidden="true" icon="mdi:source-branch" width="40" />
        <span>暂无部门</span>
        <n-button
          v-if="hasPermission('system:department:create')"
          size="small"
          type="primary"
          @click="emit('add')"
        >
          新建首个部门
        </n-button>
      </div>

      <n-tree
        v-else
        :data="props.data"
        :selected-keys="props.selectedKeys"
        :pattern="searchKeyword"
        :render-label="renderLabel"
        :expanded-keys="props.expandedKeys"
        block-line
        block-node
        @update:selected-keys="handleSelect"
        @update:expanded-keys="handleExpandedKeys"
      />
    </n-spin>
  </aside>
</template>

<style lang="scss" scoped>
.department-tree-panel {
  width: 280px;
  min-width: 280px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 8px;
  }

  &__title {
    margin: 0;
    color: var(--card-header-text);
    font-weight: 600;
  }

  &__search {
    width: auto;
    margin: 8px 12px;
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 4px 8px 12px;
  }

  &__state {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--card-empty-text);
    text-align: center;
  }
}

.department-tree-node {
  line-height: 1.4;
  min-width: 0;
  padding: 2px 0;

  &__heading {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__status {
    flex: none;
  }
}

@media (max-width: 1024px) {
  .department-tree-panel {
    width: 240px;
    min-width: 240px;
  }
}

@media (max-width: 768px) {
  .department-tree-panel {
    width: 100%;
    min-width: 0;
    max-height: 42vh;
  }
}
</style>
