import type { RoleMenuChange, RoleMenuTreeNode } from './types'
import { computed, ref, shallowRef } from 'vue'

const RISK_PERMISSION_PATTERN = /delete|remove|export|assign|grant|reset|删除|导出|授权|分配|重置/i

export function useRoleMenuPermission() {
  const role = shallowRef<System.Role | null>(null)
  const menuTree = shallowRef<RoleMenuTreeNode[]>([])
  const checkedMenuIds = ref<number[]>([])
  const originalMenuIds = shallowRef<number[]>([])

  const flatMenus = computed(() => flattenTree(menuTree.value))
  const menuMap = computed(() => new Map(flatMenus.value.map(menu => [menu.key, menu])))
  const availableMenuIds = computed(() => new Set(menuMap.value.keys()))
  const selectedMenuIds = computed(() => checkedMenuIds.value.filter(id => availableMenuIds.value.has(id)))
  const originalMenuIdSet = computed(() => new Set(originalMenuIds.value))
  const selectedMenuIdSet = computed(() => new Set(selectedMenuIds.value))

  const addedMenus = computed<RoleMenuChange[]>(() => selectedMenuIds.value
    .filter(id => !originalMenuIdSet.value.has(id))
    .map(toChange)
    .filter((menu): menu is RoleMenuChange => Boolean(menu)))

  const removedMenus = computed<RoleMenuChange[]>(() => originalMenuIds.value
    .filter(id => !selectedMenuIdSet.value.has(id))
    .map(toChange)
    .filter((menu): menu is RoleMenuChange => Boolean(menu)))

  const changeCount = computed(() => addedMenus.value.length + removedMenus.value.length)

  function initialize(record: System.Role, menus: System.Menu[], assignedMenus: System.Menu[]) {
    const formattedTree = menus.map(formatMenu)
    const validIds = new Set(flattenTree(formattedTree).map(menu => menu.key))
    const assignedIds = assignedMenus
      .map(menu => menu.id)
      .filter(id => validIds.has(id))

    role.value = record
    menuTree.value = formattedTree
    originalMenuIds.value = [...assignedIds]
    checkedMenuIds.value = [...assignedIds]
  }

  function reset() {
    role.value = null
    menuTree.value = []
    originalMenuIds.value = []
    checkedMenuIds.value = []
  }

  function updateCheckedMenuIds(ids: number[]) {
    checkedMenuIds.value = [...new Set(ids)].filter(id => availableMenuIds.value.has(id))
  }

  function restoreOriginalPermissions() {
    checkedMenuIds.value = [...originalMenuIds.value]
  }

  function commitCurrentPermissions() {
    originalMenuIds.value = [...selectedMenuIds.value]
  }

  function toChange(id: number): RoleMenuChange | null {
    const menu = menuMap.value.get(id)
    if (!menu)
      return null

    const searchableText = `${menu.name} ${menu.permission ?? ''} ${menu.code}`
    return {
      id,
      name: menu.name,
      code: menu.permission || menu.code,
      menuType: menu.menuType,
      risk: RISK_PERMISSION_PATTERN.test(searchableText),
    }
  }

  return {
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
  }
}

function formatMenu(menu: System.Menu): RoleMenuTreeNode {
  return {
    key: menu.id,
    label: menu.name,
    name: menu.name,
    code: menu.code,
    permission: menu.permission,
    menuType: menu.type,
    children: menu.children?.map(formatMenu),
  }
}

function flattenTree(tree: RoleMenuTreeNode[]): RoleMenuTreeNode[] {
  return tree.flatMap(node => [node, ...flattenTree(node.children ?? [])])
}
