<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, shallowRef } from 'vue'
import { MenuApi, RoleApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { assignablePlatforms, DEFAULT_PLATFORM, platformLabel } from '@/constants'
import RoleMenuSummary from './role-menu-permission/RoleMenuSummary.vue'
import RoleMenuTreePanel from './role-menu-permission/RoleMenuTreePanel.vue'
import { useRoleMenuPermission } from './role-menu-permission/useRoleMenuPermission'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

interface PlatformMemory {
  checked: number[]
  indeterminate: number[]
}

const loading = shallowRef(false)
const saving = shallowRef(false)
const {
  role,
  menuTree,
  flatMenus,
  checkedMenuIds,
  originalMenuIds,
  addedMenus,
  removedMenus,
  changeCount,
  initialize,
  reset,
  updateCheckedMenuIds,
  updateIndeterminateKeys,
  restoreOriginalPermissions,
  commitCurrentPermissions,
} = useRoleMenuPermission()

/** 正在配置的端 */
const activePlatform = shallowRef<string>(DEFAULT_PLATFORM)
/** 每个端的勾选/半选记忆，切换 Tab 时保存与恢复 */
const platformMemory = ref<Record<string, PlatformMemory>>({})
/** 每个端相对服务端原始授权的变更数（Tab 与保存按钮共用） */
const platformChangeCounts = ref<Record<string, number>>({})
/** 当前端的半选父节点（组合式函数未暴露，这里单独跟踪） */
const indeterminateIds = ref<number[]>([])
/** 不属于本角色可配置端的既有授权，保存时原样保留，避免被覆盖 */
const preservedMenuIds = ref<number[]>([])
const treesByPlatform = new Map<string, System.Menu[]>()
const assignedByPlatform = new Map<string, System.Menu[]>()
let currentRole: System.Role | null = null

const platformTabs = computed(() => assignablePlatforms(role.value?.platform))
const totalChangeCount = computed(() =>
  Object.values(platformChangeCounts.value).reduce((sum, count) => sum + count, 0),
)

const modalTitle = computed(() => role.value ? `分配菜单权限 · ${role.value.name}` : '分配菜单权限')
const updatedTimeLabel = computed(() => role.value?.updatedTime
  ? dayjs(role.value.updatedTime).format('YYYY-MM-DD HH:mm')
  : '暂无记录')
const saveButtonText = computed(() => totalChangeCount.value
  ? `保存权限（${totalChangeCount.value} 项变更）`
  : '保存权限')

/** Tab 角标：该端已勾选数量 */
function platformTabLabel(platform: string): string {
  const count = platform === activePlatform.value
    ? checkedMenuIds.value.length
    : (platformMemory.value[platform]?.checked.length
      ?? assignedByPlatform.get(platform)?.length
      ?? 0)
  return `${platformLabel(platform)}（${count}）`
}

function rememberActivePlatform() {
  const platform = activePlatform.value
  platformMemory.value = {
    ...platformMemory.value,
    [platform]: {
      checked: [...checkedMenuIds.value],
      indeterminate: [...indeterminateIds.value],
    },
  }
  platformChangeCounts.value = {
    ...platformChangeCounts.value,
    [platform]: changeCount.value,
  }
}

function activatePlatform(platform: string) {
  if (!currentRole)
    return

  initialize(
    currentRole,
    treesByPlatform.get(platform) ?? [],
    assignedByPlatform.get(platform) ?? [],
  )

  const memory = platformMemory.value[platform]
  checkedMenuIds.value = [
    ...(memory?.checked ?? (assignedByPlatform.get(platform) ?? []).map(menu => menu.id)),
  ]
  indeterminateIds.value = [...(memory?.indeterminate ?? [])]
  updateIndeterminateKeys(indeterminateIds.value)
  activePlatform.value = platform
  platformChangeCounts.value = {
    ...platformChangeCounts.value,
    [platform]: changeCount.value,
  }
}

function handlePlatformChange(platform: string) {
  if (platform === activePlatform.value)
    return

  rememberActivePlatform()
  activatePlatform(platform)
}

function handleCheckedKeysUpdate(ids: number[]) {
  updateCheckedMenuIds(ids)
  rememberActivePlatform()
}

function handleIndeterminateKeysUpdate(ids: number[]) {
  indeterminateIds.value = ids
  updateIndeterminateKeys(ids)
  rememberActivePlatform()
}

function resetAll() {
  reset()
  currentRole = null
  platformMemory.value = {}
  platformChangeCounts.value = {}
  indeterminateIds.value = []
  preservedMenuIds.value = []
  treesByPlatform.clear()
  assignedByPlatform.clear()
  activePlatform.value = DEFAULT_PLATFORM
}

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data: { record?: System.Role }) => {
  if (!data?.record)
    return

  resetAll()
  loading.value = true
  setModalProps({ loading: true })
  try {
    currentRole = data.record
    // 角色只能配置「自身端 + 通用端」，服务端同样会拒绝跨端分配
    const platforms = assignablePlatforms(data.record.platform)
    const [trees, roleDetail] = await Promise.all([
      Promise.all(platforms.map(platform => MenuApi.tree(platform))),
      RoleApi.detail(data.record.id),
    ])
    const assignedMenus = roleDetail?.menus ?? []

    platforms.forEach((platform, index) => {
      treesByPlatform.set(platform, trees[index] ?? [])
      assignedByPlatform.set(
        platform,
        assignedMenus.filter(
          menu => (menu.platform ?? DEFAULT_PLATFORM) === platform,
        ),
      )
    })

    // 历史数据里可能存在其他端的授权：不在本界面展示，但保存时保留
    preservedMenuIds.value = assignedMenus
      .filter(menu => !platforms.includes(menu.platform ?? DEFAULT_PLATFORM))
      .map(menu => menu.id)

    activatePlatform(platforms[0] ?? DEFAULT_PLATFORM)
  }
  finally {
    loading.value = false
    setModalProps({ loading: false })
  }
})

async function handleOk() {
  if (!role.value || saving.value || !totalChangeCount.value)
    return

  rememberActivePlatform()

  const selected = new Set<number>(preservedMenuIds.value)
  Object.values(platformMemory.value).forEach((memory) => {
    memory.checked.forEach(id => selected.add(id))
    memory.indeterminate.forEach(id => selected.add(id))
  })

  saving.value = true
  try {
    // 半选父节点并入 menuIds，保证后端按 pid 建树不断链
    await RoleApi.assignMenu(role.value.id, [...selected])
    commitCurrentPermissions()
    window.$message?.success?.(`已更新「${role.value.name}」的权限配置`)
    closeModal()
    emit('success')
  }
  finally {
    saving.value = false
  }
}

async function handleBeforeClose() {
  if (!totalChangeCount.value || saving.value)
    return !saving.value

  const dialog = window.$dialog
  if (!dialog)
    return true

  return new Promise<boolean>((resolve) => {
    dialog.warning({
      title: '放弃权限变更？',
      content: `当前有 ${totalChangeCount.value} 项权限变更尚未保存，关闭后将丢失。`,
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
          在一棵树内完成配置：勾选菜单即授予页面访问，菜单下的按钮节点对应页面操作权限
        </span>
      </div>

      <div class="role-menu-permission__platforms">
        <n-radio-group
          :value="activePlatform"
          size="small"
          @update:value="handlePlatformChange"
        >
          <n-radio-button
            v-for="platform in platformTabs"
            :key="platform"
            :value="platform"
            :label="platformTabLabel(platform)"
          />
        </n-radio-group>
        <span class="role-menu-permission__platforms-hint">
          角色属于「{{ platformLabel(role?.platform || DEFAULT_PLATFORM) }}」，仅可配置本端与通用端的权限
        </span>
      </div>

      <div class="role-menu-permission__body">
        <RoleMenuTreePanel
          :data="menuTree"
          :checked-keys="checkedMenuIds"
          @update:checked-keys="handleCheckedKeysUpdate"
          @update:indeterminate-keys="handleIndeterminateKeysUpdate"
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
          <span v-if="originalMenuIds.length">本端已分配 {{ originalMenuIds.length }} 项</span>
        </div>
        <n-space>
          <n-button :disabled="saving" @click="handleCancel">
            取消
          </n-button>
          <n-button
            type="primary"
            :disabled="loading || !role || !totalChangeCount"
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

.role-menu-permission__platforms {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.role-menu-permission__platforms-hint {
  color: var(--n-text-color-3);
  font-size: 12px;
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

  .role-menu-permission__platforms-hint {
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
