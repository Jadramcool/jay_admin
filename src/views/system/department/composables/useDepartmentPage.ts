import type { DepartmentTreeNode } from '../types'
import { computed, ref, shallowRef } from 'vue'
import { DepartmentApi } from '@/api/system'

interface LoadTreeOptions {
  fallbackId?: number | null
  preferredId?: number | null
}

interface SelectDepartmentOptions {
  force?: boolean
}

function formatTreeNode(
  department: System.Department,
  parentId: number | null = null,
): DepartmentTreeNode {
  const children = department.children?.map(child => formatTreeNode(child, department.id))
  return {
    key: department.id,
    label: department.name,
    code: department.code,
    status: department.status,
    parentId: department.parentId ?? parentId,
    directChildCount: department.directChildCount ?? children?.length ?? 0,
    isLeaf: !children?.length,
    children: children?.length ? children : undefined,
  }
}

function collectKeys(nodes: DepartmentTreeNode[], keys = new Set<number>()) {
  nodes.forEach((node) => {
    keys.add(node.key)
    if (node.children)
      collectKeys(node.children, keys)
  })
  return keys
}

function findNode(nodes: DepartmentTreeNode[], id: number): DepartmentTreeNode | null {
  for (const node of nodes) {
    if (node.key === id)
      return node
    if (node.children) {
      const match = findNode(node.children, id)
      if (match)
        return match
    }
  }
  return null
}

function findAncestorKeys(
  nodes: DepartmentTreeNode[],
  id: number,
  ancestors: number[] = [],
): number[] {
  for (const node of nodes) {
    if (node.key === id)
      return ancestors
    if (node.children) {
      const result = findAncestorKeys(node.children, id, [...ancestors, node.key])
      if (result.length || node.children.some(child => child.key === id))
        return result
    }
  }
  return []
}

export function useDepartmentPage() {
  const treeData = ref<DepartmentTreeNode[]>([])
  const selectedKeys = ref<number[]>([])
  const expandedKeys = ref<number[]>([])
  const selectedDept = shallowRef<System.Department | null>(null)
  const selectedDeptId = shallowRef<number | null>(null)
  const treeLoading = shallowRef(false)
  const treeError = shallowRef('')
  const detailLoading = shallowRef(false)
  const detailError = shallowRef('')
  let detailRequestId = 0

  const selectedTreeNode = computed(() => {
    const id = selectedDeptId.value
    return id ? findNode(treeData.value, id) : null
  })
  const directChildCount = computed(() =>
    selectedDept.value?.directChildCount
    ?? selectedTreeNode.value?.directChildCount
    ?? 0,
  )

  async function selectDepartment(
    id: number,
    options: SelectDepartmentOptions = {},
  ) {
    if (!findNode(treeData.value, id))
      return false

    if (
      !options.force
      && selectedDeptId.value === id
      && selectedDept.value
      && !detailError.value
    ) {
      return true
    }

    selectedDeptId.value = id
    selectedKeys.value = [id]
    selectedDept.value = null
    expandedKeys.value = Array.from(new Set([
      ...expandedKeys.value,
      ...findAncestorKeys(treeData.value, id),
    ]))
    detailError.value = ''
    detailLoading.value = true

    const requestId = ++detailRequestId
    try {
      const detail = await DepartmentApi.detail(id)
      if (requestId !== detailRequestId || selectedDeptId.value !== id)
        return false
      selectedDept.value = detail
      return true
    }
    catch {
      if (requestId === detailRequestId) {
        selectedDept.value = null
        detailError.value = '部门详情加载失败，请重试。'
      }
      return false
    }
    finally {
      if (requestId === detailRequestId)
        detailLoading.value = false
    }
  }

  async function loadTree(options: LoadTreeOptions = {}) {
    treeLoading.value = true
    treeError.value = ''
    const previousExpandedKeys = expandedKeys.value
    const currentId = selectedDeptId.value

    try {
      const result = await DepartmentApi.tree()
      const nodes = (result ?? []).map(department => formatTreeNode(department))
      const availableKeys = collectKeys(nodes)
      const targetId = [
        options.preferredId,
        options.fallbackId,
        currentId,
        nodes[0]?.key,
      ].find(id => id != null && availableKeys.has(id)) ?? null

      treeData.value = nodes
      if (!targetId) {
        selectedDeptId.value = null
        selectedKeys.value = []
        selectedDept.value = null
        expandedKeys.value = []
        return null
      }

      const preservedKeys = previousExpandedKeys.filter(key => availableKeys.has(key))
      const defaultExpandedKeys = nodes.map(node => node.key)
      expandedKeys.value = Array.from(new Set([
        ...(preservedKeys.length ? preservedKeys : defaultExpandedKeys),
        ...findAncestorKeys(nodes, targetId),
      ]))
      await selectDepartment(targetId, { force: true })
      return targetId
    }
    catch {
      treeError.value = '部门结构加载失败，请重试。'
      return null
    }
    finally {
      treeLoading.value = false
    }
  }

  async function retryDetail() {
    if (selectedDeptId.value)
      await selectDepartment(selectedDeptId.value, { force: true })
  }

  function getParentId(id: number) {
    return findNode(treeData.value, id)?.parentId ?? null
  }

  function updateTreeNodeStatus(id: number, status: 0 | 1) {
    const node = findNode(treeData.value, id)
    if (!node)
      return false

    node.status = status
    return true
  }

  return {
    detailError,
    detailLoading,
    directChildCount,
    expandedKeys,
    getParentId,
    loadTree,
    retryDetail,
    selectDepartment,
    selectedDept,
    selectedDeptId,
    selectedKeys,
    treeData,
    treeError,
    treeLoading,
    updateTreeNodeStatus,
  }
}
