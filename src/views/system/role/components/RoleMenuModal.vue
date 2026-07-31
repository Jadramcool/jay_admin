<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, shallowRef } from 'vue'
import { MenuApi, RoleApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import RoleMenuSummary from './role-menu-permission/RoleMenuSummary.vue'
import RoleMenuTreePanel from './role-menu-permission/RoleMenuTreePanel.vue'
import { useRoleMenuPermission } from './role-menu-permission/useRoleMenuPermission'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const loading = shallowRef(false)
const saving = shallowRef(false)
const {
  role,
  menuTree,
  flatMenus,
  checkedMenuIds,
  originalMenuIds,
  selectedMenuIds,
  addedMenus,
  removedMenus,
  changeCount,
  initialize,
  reset,
  updateCheckedMenuIds,
  restoreOriginalPermissions,
  commitCurrentPermissions,
} = useRoleMenuPermission()

const modalTitle = computed(() => role.value ? `分配菜单权限 · ${role.value.name}` : '分配菜单权限')
const updatedTimeLabel = computed(() => role.value?.updatedTime
  ? dayjs(role.value.updatedTime).format('YYYY-MM-DD HH:mm')
  : '暂无记录')
const saveButtonText = computed(() => changeCount.value
  ? `保存权限（${changeCount.value} 项变更）`
  : '保存权限')

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data: { record?: System.Role }) => {
  if (!data?.record)
    return

  reset()
  loading.value = true
  setModalProps({ loading: true })
  try {
    const [menus, roleDetail] = await Promise.all([
      MenuApi.tree(),
      RoleApi.detail(data.record.id),
    ])
    initialize(data.record, menus ?? [], roleDetail?.menus ?? [])
  }
  finally {
    loading.value = false
    setModalProps({ loading: false })
  }
})

async function handleOk() {
  if (!role.value || saving.value || !changeCount.value)
    return

  saving.value = true
  try {
    await RoleApi.assignMenu(role.value.id, selectedMenuIds.value)
    commitCurrentPermissions()
    window.$message?.success?.(`已更新「${role.value.name}」的菜单权限`)
    closeModal()
    emit('success')
  }
  finally {
    saving.value = false
  }
}

async function handleBeforeClose() {
  if (!changeCount.value || saving.value)
    return !saving.value

  const dialog = window.$dialog
  if (!dialog)
    return true

  return new Promise<boolean>((resolve) => {
    dialog.warning({
      title: '放弃权限变更？',
      content: `当前有 ${changeCount.value} 项权限变更尚未保存，关闭后将丢失。`,
      positiveText: '放弃变更',
      negativeText: '继续编辑',
      onPositiveClick: () => resolve(true),
      onNegativeClick: () => resolve(false),
      onClose: () => resolve(false),
      onMaskClick: () => resolve(false),
    })
  })
}

async function handleCancel() {
  if (await handleBeforeClose())
    closeModal()
}
</script>

<template>
  <BasicModal
    :title="modalTitle"
    width="min(1180px, calc(100vw - 48px))"
    height="min(700px, calc(100vh - 140px))"
    :close-func="handleBeforeClose"
    :show-ok-button="false"
    :show-cancel-button="false"
    @register="registerModal"
  >
    <div class="role-menu-permission">
      <div class="role-menu-permission__intro">
        <div class="role-menu-permission__role">
          <span class="role-menu-permission__role-name">{{ role?.name ?? '角色' }}</span>
          <n-tag v-if="role?.code" :bordered="false" type="info" size="small">
            {{ role.code }}
          </n-tag>
        </div>
        <span class="role-menu-permission__description">
          为该角色配置可访问的目录、菜单及页面操作权限
        </span>
      </div>

      <div class="role-menu-permission__body">
        <RoleMenuTreePanel
          :data="menuTree"
          :checked-keys="checkedMenuIds"
          @update:checked-keys="updateCheckedMenuIds"
        />
        <RoleMenuSummary
          :menus="flatMenus"
          :checked-keys="checkedMenuIds"
          :added-menus="addedMenus"
          :removed-menus="removedMenus"
          @restore="restoreOriginalPermissions"
        />
      </div>
    </div>

    <template #action>
      <div class="role-menu-permission__footer">
        <div class="role-menu-permission__updated">
          <span>上次更新：{{ updatedTimeLabel }}</span>
          <span v-if="originalMenuIds.length">原权限 {{ originalMenuIds.length }} 项</span>
        </div>
        <n-space>
          <n-button :disabled="saving" @click="handleCancel">
            取消
          </n-button>
          <n-button
            type="primary"
            :disabled="loading || !role || !changeCount"
            :loading="saving"
            @click="handleOk"
          >
            {{ saveButtonText }}
          </n-button>
        </n-space>
      </div>
    </template>
  </BasicModal>
</template>

<style scoped lang="scss">
.role-menu-permission {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 2px 4px 8px;
  background: #fff;
}

.role-menu-permission__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid #e2e5e9;
  border-radius: 8px;
  background: #fff;
}

.role-menu-permission__role {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-menu-permission__role-name {
  font-weight: 600;
  color: #1f2329;
}

.role-menu-permission__description {
  color: #646a73;
  font-size: 13px;
}

.role-menu-permission__body {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 20px;
  flex: 1;
}

.role-menu-permission__footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.role-menu-permission__updated {
  display: flex;
  gap: 16px;
  color: var(--n-text-color-3);
  font-size: 12px;
}

@media (max-width: 900px) {
  .role-menu-permission__description {
    display: none;
  }

  .role-menu-permission__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .role-menu-permission__body :deep(.permission-summary) {
    display: none;
  }
}
</style>
