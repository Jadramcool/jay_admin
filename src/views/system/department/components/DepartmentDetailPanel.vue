<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { hasPermission } from '@/utils/common/hasPermission'

const props = defineProps<{
  actionLoading: 'delete' | 'status' | null
  department: System.Department | null
  directChildCount: number
  error: string
  loading: boolean
}>()

const emit = defineEmits<{
  addChild: [department: System.Department]
  delete: [department: System.Department]
  edit: [department: System.Department]
  retry: []
  toggleStatus: [department: System.Department]
}>()

const includeChildren = defineModel<boolean>('includeChildren', { default: false })
const statusConfirmText = computed(() => {
  const department = props.department
  if (!department)
    return ''
  return department.status === 1
    ? `禁用「${department.name}」可能影响其成员使用，确定继续吗？`
    : `确定启用「${department.name}」吗？`
})

function getDepartmentIcon(code: string) {
  const icons: Record<string, string> = {
    FINANCE: 'mdi:currency-usd',
    HQ: 'mdi:domain',
    HR: 'mdi:account-group',
    IT: 'mdi:laptop',
    MARKETING: 'mdi:bullhorn',
    OPERATIONS: 'mdi:cog',
    R_D: 'mdi:flask',
  }
  return icons[code] ?? 'mdi:folder-outline'
}
</script>

<template>
  <section class="department-detail-panel" aria-live="polite">
    <div v-if="props.error && !props.department" class="department-detail-panel__state" role="alert">
      <Icon aria-hidden="true" icon="mdi:cloud-alert-outline" width="56" />
      <p>{{ props.error }}</p>
      <n-button @click="emit('retry')">
        重新加载
      </n-button>
    </div>

    <div v-else-if="!props.department && !props.loading" class="department-detail-panel__state text-sm">
      <Icon aria-hidden="true" icon="mdi:folder-open-outline" width="64" />
      <p>请从左侧选择一个部门</p>
    </div>

    <n-spin v-else :show="props.loading" class="department-detail-panel__spin">
      <template v-if="props.department">
        <header class="department-detail-panel__header">
          <div class="department-detail-panel__identity">
            <Icon
              aria-hidden="true"
              :icon="getDepartmentIcon(props.department.code)"
              width="22"
            />
            <h2 class="department-detail-panel__title text-lg">
              {{ props.department.name }}
            </h2>
            <n-tag size="small" :bordered="false" type="info">
              {{ props.department.code }}
            </n-tag>
            <n-tag
              size="small"
              :bordered="false"
              :type="props.department.status === 1 ? 'success' : 'warning'"
            >
              {{ props.department.status === 1 ? "启用" : "禁用" }}
            </n-tag>
          </div>

          <n-space wrap>
            <n-button
              v-if="hasPermission('system:department:update')"
              size="small"
              :disabled="props.actionLoading !== null"
              @click="emit('edit', props.department)"
            >
              编辑部门
            </n-button>
            <n-button
              v-if="hasPermission('system:department:create')"
              size="small"
              :disabled="props.actionLoading !== null"
              @click="emit('addChild', props.department)"
            >
              添加子部门
            </n-button>
            <n-popconfirm
              v-if="hasPermission('system:department:update')"
              @positive-click="emit('toggleStatus', props.department)"
            >
              <template #trigger>
                <n-button
                  size="small"
                  :loading="props.actionLoading === 'status'"
                  :disabled="props.actionLoading !== null"
                  :type="props.department.status === 1 ? 'warning' : 'success'"
                >
                  {{ props.department.status === 1 ? "禁用" : "启用" }}
                </n-button>
              </template>
              {{ statusConfirmText }}
            </n-popconfirm>
            <n-popconfirm
              v-if="hasPermission('system:department:delete')"
              @positive-click="emit('delete', props.department)"
            >
              <template #trigger>
                <n-button
                  size="small"
                  type="error"
                  :loading="props.actionLoading === 'delete'"
                  :disabled="props.actionLoading !== null"
                >
                  删除
                </n-button>
              </template>
              确定删除部门「{{ props.department.name }}」吗？删除后将优先返回其父部门。
            </n-popconfirm>
          </n-space>
        </header>

        <div class="department-detail-panel__stats text-sm">
          <div class="department-detail-panel__counts">
            <span>直属子部门 {{ props.directChildCount }} 个</span>
            <span v-if="props.department.memberCount != null">
              直属成员 {{ props.department.memberCount }} 人
            </span>
          </div>
          <label class="department-detail-panel__toggle">
            <n-switch v-model:value="includeChildren" size="small" />
            <span class="text-xs">包含子部门成员</span>
          </label>
        </div>

        <slot />
      </template>
    </n-spin>
  </section>
</template>

<style lang="scss" scoped>
.department-detail-panel {
  min-width: 0;
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__spin {
    min-height: 0;
    flex: 1;

    :deep(.n-spin-content) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 12px;
  }

  &__identity,
  &__counts,
  &__toggle {
    display: flex;
    align-items: center;
  }

  &__identity {
    min-width: 0;
    gap: 8px;
  }

  &__title {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--card-header-text);
    font-weight: 600;
  }

  &__stats {
    color: var(--card-sub-text);
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--card-divider);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__counts {
    gap: 16px;
    flex-wrap: wrap;
  }

  &__toggle {
    flex-shrink: 0;
    gap: 6px;
    color: var(--card-toggle-text);
    cursor: pointer;
    user-select: none;
  }

  &__state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--card-empty-text);
    text-align: center;
  }
}

@media (max-width: 768px) {
  .department-detail-panel {
    min-height: 520px;
    padding: 14px;

    &__stats {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
