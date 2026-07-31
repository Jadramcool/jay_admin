<script setup lang="ts">
import type { RoleMenuChange, RoleMenuTreeNode } from './types'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps<{
  menus: RoleMenuTreeNode[]
  checkedKeys: number[]
  addedMenus: RoleMenuChange[]
  removedMenus: RoleMenuChange[]
}>()

const emit = defineEmits<{
  restore: []
}>()

const checkedKeySet = computed(() => new Set(props.checkedKeys))
const selectedMenus = computed(() => props.menus.filter(menu => checkedKeySet.value.has(menu.key)))
const selectionPercentage = computed(() => props.menus.length
  ? Math.round(selectedMenus.value.length / props.menus.length * 100)
  : 0)
const typeCounts = computed(() => ({
  DIRECTORY: selectedMenus.value.filter(menu => menu.menuType === 'DIRECTORY').length,
  MENU: selectedMenus.value.filter(menu => menu.menuType === 'MENU').length,
  BUTTON: selectedMenus.value.filter(menu => menu.menuType === 'BUTTON').length,
}))
const changes = computed(() => [
  ...props.addedMenus.map(menu => ({ ...menu, action: 'add' as const })),
  ...props.removedMenus.map(menu => ({ ...menu, action: 'remove' as const })),
])
const visibleChanges = computed(() => changes.value.slice(0, 5))
const hiddenChangeCount = computed(() => Math.max(changes.value.length - visibleChanges.value.length, 0))
const riskChangeCount = computed(() => changes.value.filter(change => change.risk).length)
</script>

<template>
  <aside class="permission-summary">
    <div class="permission-summary__header">
      <span class="permission-summary__title">授权摘要</span>
      <n-tag size="small" :bordered="false" type="info">
        {{ selectionPercentage }}%
      </n-tag>
    </div>

    <div class="permission-summary__count">
      <strong>{{ selectedMenus.length }}</strong>
      <span>/ {{ menus.length }} 项</span>
    </div>
    <n-progress
      type="line"
      :percentage="selectionPercentage"
      :show-indicator="false"
      :height="7"
      border-radius="4px"
    />

    <div class="permission-summary__types">
      <span class="permission-summary__type is-directory">目录 {{ typeCounts.DIRECTORY }}</span>
      <span class="permission-summary__type is-menu">菜单 {{ typeCounts.MENU }}</span>
      <span class="permission-summary__type is-button">按钮 {{ typeCounts.BUTTON }}</span>
    </div>

    <n-divider />

    <div class="permission-summary__section-title">
      <span>本次变更</span>
      <span v-if="!changes.length" class="permission-summary__unchanged">暂无变更</span>
    </div>

    <div v-if="changes.length" class="permission-summary__change-tags">
      <n-tag :bordered="false" type="success" size="small">
        + 新增 {{ addedMenus.length }} 项
      </n-tag>
      <n-tag :bordered="false" type="error" size="small">
        − 移除 {{ removedMenus.length }} 项
      </n-tag>
    </div>

    <div v-if="visibleChanges.length" class="permission-summary__changes">
      <div
        v-for="change in visibleChanges"
        :key="`${change.action}-${change.id}`"
        class="permission-summary__change"
      >
        <span
          class="permission-summary__change-icon"
          :class="`is-${change.action}`"
        >
          {{ change.action === 'add' ? '+' : '−' }}
        </span>
        <div class="permission-summary__change-content">
          <div class="permission-summary__change-name">
            <span>{{ change.name }}</span>
            <n-tag v-if="change.risk" :bordered="false" type="error" size="tiny">
              高风险
            </n-tag>
          </div>
          <span class="permission-summary__change-code">{{ change.code }}</span>
        </div>
      </div>
      <span v-if="hiddenChangeCount" class="permission-summary__more">
        还有 {{ hiddenChangeCount }} 项变更将在保存时一并提交
      </span>
    </div>

    <div v-else class="permission-summary__empty-change">
      调整左侧权限后，可在此确认新增和移除项
    </div>

    <div class="permission-summary__principle" :class="{ 'has-risk': riskChangeCount }">
      <Icon icon="icon-park-outline:shield" class="permission-summary__principle-icon" />
      <div>
        <strong>{{ riskChangeCount ? `包含 ${riskChangeCount} 项高风险变更` : '最小权限原则' }}</strong>
        <p>请仅授予该角色完成工作所需的权限，避免开放无关操作。</p>
      </div>
    </div>

    <n-button block secondary @click="emit('restore')">
      <template #icon>
        <Icon icon="icon-park-outline:undo" />
      </template>
      恢复原权限
    </n-button>
  </aside>
</template>

<style scoped lang="scss">
.permission-summary {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #e2e5e9;
  border-radius: 10px;
  background: #fff;
}

.permission-summary__header,
.permission-summary__section-title,
.permission-summary__change-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.permission-summary__title,
.permission-summary__section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.permission-summary__count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 16px 0 8px;
}

.permission-summary__count strong {
  font-size: 28px;
  line-height: 1;
  color: #2080f0;
}

.permission-summary__count span {
  color: var(--n-text-color-3);
}

.permission-summary__types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 18px;
}

.permission-summary__type {
  padding: 7px 4px;
  border-radius: 16px;
  color: #2080f0;
  background: #eaf3ff;
  font-size: 12px;
  text-align: center;
}

.permission-summary__type.is-menu {
  color: #18a058;
  background: #eaf8ef;
}

.permission-summary__type.is-button {
  color: #d9822b;
  background: #fff3e3;
}

.permission-summary :deep(.n-divider) {
  margin: 22px 0;
}

.permission-summary__unchanged,
.permission-summary__more,
.permission-summary__change-code,
.permission-summary__empty-change {
  color: var(--n-text-color-3);
  font-size: 12px;
}

.permission-summary__change-tags {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.permission-summary__changes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.permission-summary__change {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.permission-summary__change-icon {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #18a058;
  background: #eaf8ef;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.permission-summary__change-icon.is-remove {
  color: #d03050;
  background: #fff0f0;
}

.permission-summary__change-content {
  min-width: 0;
  flex: 1;
}

.permission-summary__change-name {
  font-size: 13px;
}

.permission-summary__change-code {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-summary__more {
  line-height: 1.5;
}

.permission-summary__empty-change {
  display: grid;
  min-height: 90px;
  place-items: center;
  padding: 0 20px;
  line-height: 1.7;
  text-align: center;
}

.permission-summary__principle {
  display: flex;
  gap: 10px;
  margin-top: auto;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #f1d49b;
  border-radius: 8px;
  color: #7a5400;
  background: #fff8e8;
}

.permission-summary__principle.has-risk {
  border-color: #f1b8c2;
  color: #a9203d;
  background: #fff1f3;
}

.permission-summary__principle-icon {
  flex: none;
  margin-top: 2px;
  font-size: 20px;
}

.permission-summary__principle strong {
  font-size: 13px;
}

.permission-summary__principle p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
