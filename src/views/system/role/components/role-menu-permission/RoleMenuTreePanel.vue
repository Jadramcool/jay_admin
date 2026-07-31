<script setup lang="ts">
import type { TreeOption } from 'naive-ui'
import type { VNodeChild } from 'vue'
import type { PermissionFilter, RoleMenuTreeNode } from './types'
import { Icon } from '@iconify/vue'
import { computed, h, ref, shallowRef, watch } from 'vue'

const props = defineProps<{
  data: RoleMenuTreeNode[]
  checkedKeys: number[]
}>()

const emit = defineEmits<{
  'update:checkedKeys': [keys: number[]]
}>()

const searchKeyword = shallowRef('')
const permissionFilter = shallowRef<PermissionFilter>('all')
const expandedKeys = ref<number[]>([])

const filterOptions: Array<{ label: string, value: PermissionFilter }> = [
  { label: '全部', value: 'all' },
  { label: '已选择', value: 'checked' },
  { label: '未选择', value: 'unchecked' },
]

const allNodes = computed(() => flattenTree(props.data))
const allNodeIds = computed(() => allNodes.value.map(node => node.key))
const parentNodeIds = computed(() => allNodes.value.filter(node => node.children?.length).map(node => node.key))
const checkedKeySet = computed(() => new Set(props.checkedKeys))
const treePattern = computed(() => searchKeyword.value.trim() || (permissionFilter.value === 'all' ? '' : '__permission_filter__'))

watch(
  () => props.data,
  () => {
    expandedKeys.value = [...parentNodeIds.value]
  },
  { immediate: true },
)

function handleCheckedKeysUpdate(keys: Array<string | number>) {
  emit('update:checkedKeys', keys.map(Number))
}

function handleExpandedKeysUpdate(keys: Array<string | number>) {
  expandedKeys.value = keys.map(Number)
}

function filterNode(_pattern: string, option: TreeOption) {
  const node = option as RoleMenuTreeNode
  const keyword = searchKeyword.value.trim().toLocaleLowerCase()
  const matchesKeyword = !keyword || `${node.name} ${node.code} ${node.permission ?? ''}`.toLocaleLowerCase().includes(keyword)
  const isChecked = checkedKeySet.value.has(node.key)
  const matchesSelection = permissionFilter.value === 'all'
    || (permissionFilter.value === 'checked' ? isChecked : !isChecked)

  return matchesKeyword && matchesSelection
}

function renderLabel({ option }: { option: TreeOption }): VNodeChild {
  const node = option as RoleMenuTreeNode
  const iconMap: Record<System.Menu['type'], string> = {
    DIRECTORY: 'icon-park-outline:folder-open',
    MENU: 'icon-park-outline:file-text',
    BUTTON: 'icon-park-outline:click-tap-two',
  }
  const typeLabelMap: Record<System.Menu['type'], string> = {
    DIRECTORY: '目录',
    MENU: '菜单',
    BUTTON: '按钮',
  }

  return h('div', { class: 'permission-tree-label' }, [
    h(Icon, { icon: iconMap[node.menuType], class: `permission-tree-label__icon is-${node.menuType.toLocaleLowerCase()}` }),
    h('span', { class: 'permission-tree-label__name' }, node.name),
    h('span', { class: `permission-tree-label__type is-${node.menuType.toLocaleLowerCase()}` }, typeLabelMap[node.menuType]),
    h('span', { class: 'permission-tree-label__code' }, node.permission || node.code),
  ])
}

function renderSuffix({ option }: { option: TreeOption }): VNodeChild {
  const node = option as RoleMenuTreeNode
  if (!node.children?.length)
    return null

  const groupIds = [node.key, ...flattenTree(node.children).map(child => child.key)]
  const isGroupChecked = groupIds.every(id => checkedKeySet.value.has(id))

  return h('div', { class: 'permission-tree-suffix' }, [
    h('span', { class: 'permission-tree-suffix__count' }, `${groupIds.length} 项`),
    h('button', {
      'type': 'button',
      'class': ['permission-tree-suffix__action', { 'is-cancel': isGroupChecked }],
      'aria-label': isGroupChecked ? `取消选择${node.name}分组` : `选择${node.name}分组`,
      'title': isGroupChecked ? '取消本组' : '全选本组',
      'onClick': (event: MouseEvent) => {
        event.stopPropagation()
        toggleGroup(groupIds, isGroupChecked)
      },
    }, isGroupChecked ? '取消' : '全选'),
  ])
}

function toggleGroup(groupIds: number[], isGroupChecked: boolean) {
  const nextKeys = new Set(props.checkedKeys)
  groupIds.forEach((id) => {
    if (isGroupChecked)
      nextKeys.delete(id)
    else
      nextKeys.add(id)
  })
  emit('update:checkedKeys', [...nextKeys])
}

function selectAll() {
  emit('update:checkedKeys', [...allNodeIds.value])
}

function clearAll() {
  emit('update:checkedKeys', [])
}

function flattenTree(tree: RoleMenuTreeNode[]): RoleMenuTreeNode[] {
  return tree.flatMap(node => [node, ...flattenTree(node.children ?? [])])
}
</script>

<template>
  <section class="permission-tree-panel">
    <div class="permission-tree-panel__heading">
      <div>
        <span class="permission-tree-panel__title">权限菜单</span>
        <span class="permission-tree-panel__total">共 {{ allNodes.length }} 项</span>
      </div>
      <div class="permission-tree-panel__bulk-actions">
        <button type="button" @click="selectAll">
          全选
        </button>
        <button type="button" @click="clearAll">
          清空
        </button>
      </div>
    </div>

    <div class="permission-tree-panel__toolbar">
      <n-input
        v-model:value="searchKeyword"
        clearable
        placeholder="搜索菜单名称或权限标识"
      >
        <template #prefix>
          <Icon icon="icon-park-outline:search" />
        </template>
      </n-input>
      <n-radio-group v-model:value="permissionFilter" size="small">
        <n-radio-button
          v-for="option in filterOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </n-radio-button>
      </n-radio-group>
      <n-button-group size="small">
        <NButton @click="expandedKeys = [...parentNodeIds]">
          展开全部
        </NButton>
        <NButton @click="expandedKeys = []">
          收起全部
        </NButton>
      </n-button-group>
    </div>

    <div class="permission-tree-panel__content">
      <n-empty v-if="!data.length" description="暂无可分配的菜单权限" />
      <n-tree
        v-else
        block-line
        cascade
        checkable
        expand-on-click
        virtual-scroll
        :checked-keys="checkedKeys"
        :data="data"
        :expanded-keys="expandedKeys"
        :filter="filterNode"
        :pattern="treePattern"
        :render-label="renderLabel"
        :render-suffix="renderSuffix"
        :show-irrelevant-nodes="false"
        @update:checked-keys="handleCheckedKeysUpdate"
        @update:expanded-keys="handleExpandedKeysUpdate"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.permission-tree-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.permission-tree-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
}

.permission-tree-panel__title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.permission-tree-panel__total {
  margin-left: 10px;
  font-size: 12px;
  color: var(--n-text-color-3);
}

.permission-tree-panel__bulk-actions {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #d9dde4;
  border-radius: 7px;
  background: #fff;
}

.permission-tree-panel__bulk-actions button {
  min-width: 58px;
  height: 30px;
  padding: 0 14px;
  border: 0;
  color: #4e5969;
  background: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    color 0.16s ease,
    background-color 0.16s ease;
}

.permission-tree-panel__bulk-actions button + button {
  border-left: 1px solid #e2e5e9;
}

.permission-tree-panel__bulk-actions button:hover {
  color: #1677ff;
  background: #f5f7fa;
}

.permission-tree-panel__bulk-actions button:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid rgb(22 119 255 / 22%);
  outline-offset: -2px;
}

.permission-tree-panel__toolbar {
  display: grid;
  grid-template-columns: minmax(230px, 1fr) auto auto;
  gap: 12px;
  align-items: center;
}

.permission-tree-panel__content {
  height: 500px;
  padding: 10px;
  overflow: hidden;
  border: 1px solid #e2e5e9;
  border-radius: 9px;
  background: #fff;
}

.permission-tree-panel__content :deep(.n-tree) {
  height: 100%;
}

.permission-tree-panel__content :deep(.n-tree-node-content) {
  min-width: 0;
}

.permission-tree-panel__content :deep(.n-tree-node-wrapper) {
  padding: 2px 0;
}

.permission-tree-panel__content :deep(.n-tree-node-content:hover) {
  background: #f5f6f7;
}

.permission-tree-panel__content :deep(.permission-tree-label) {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-tree-panel__content :deep(.permission-tree-label__icon) {
  flex: none;
  font-size: 17px;
  color: #7d8ba1;
}

.permission-tree-panel__content :deep(.permission-tree-label__icon.is-directory) {
  color: #2080f0;
}

.permission-tree-panel__content :deep(.permission-tree-label__icon.is-button) {
  color: #f0a020;
}

.permission-tree-panel__content :deep(.permission-tree-label__name) {
  flex: none;
  font-weight: 500;
}

.permission-tree-panel__content :deep(.permission-tree-label__type) {
  flex: none;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
  color: #2080f0;
  background: #edf5ff;
}

.permission-tree-panel__content :deep(.permission-tree-label__type.is-menu) {
  color: #18a058;
  background: #edf8f1;
}

.permission-tree-panel__content :deep(.permission-tree-label__type.is-button) {
  color: #d9822b;
  background: #fff5e8;
}

.permission-tree-panel__content :deep(.permission-tree-label__code) {
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-tree-panel__content :deep(.permission-tree-suffix) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-tree-panel__content :deep(.permission-tree-suffix__count) {
  min-width: 34px;
  color: var(--n-text-color-3);
  font-size: 12px;
  text-align: right;
  white-space: nowrap;
}

.permission-tree-panel__content :deep(.permission-tree-suffix__action) {
  width: 46px;
  height: 26px;
  padding: 0;
  border: 1px solid #d9dde4;
  border-radius: 6px;
  color: #4e5969;
  background: #fff;
  font: inherit;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  transition:
    color 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease;
}

.permission-tree-panel__content :deep(.permission-tree-suffix__action:hover) {
  border-color: #91c3ff;
  color: #1677ff;
  background: #f5f9ff;
}

.permission-tree-panel__content :deep(.permission-tree-suffix__action.is-cancel:hover) {
  border-color: #f0a8b6;
  color: #d03050;
  background: #fff7f8;
}

.permission-tree-panel__content :deep(.permission-tree-suffix__action:focus-visible) {
  outline: 2px solid rgb(22 119 255 / 22%);
  outline-offset: 1px;
}

@media (max-width: 1050px) {
  .permission-tree-panel__toolbar {
    grid-template-columns: 1fr auto;
  }

  .permission-tree-panel__toolbar :deep(.n-button-group) {
    display: none;
  }
}
</style>
