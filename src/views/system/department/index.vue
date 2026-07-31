<script setup lang="ts">
import type { DepartmentSaveResult } from './types'
import { onMounted, shallowRef, watch } from 'vue'
import { DepartmentApi } from '@/api/system'
import DepartmentDetailPanel from './components/DepartmentDetailPanel.vue'
import DepartmentMembersTable from './components/DepartmentMembersTable.vue'
import DepartmentModal from './components/DepartmentModal.vue'
import DepartmentTreePanel from './components/DepartmentTreePanel.vue'
import { useDepartmentPage } from './composables/useDepartmentPage'

const includeChildren = shallowRef(
  localStorage.getItem('dept_includeChildren') === 'true',
)
const actionLoading = shallowRef<'delete' | 'status' | null>(null)
const [registerModal, { openModal }] = useModal()

const {
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
} = useDepartmentPage()

function handleAdd() {
  openModal({ isUpdate: false })
}

function handleAddChild(department: System.Department) {
  openModal({
    isUpdate: false,
    record: { parentId: department.id },
  })
}

function handleEdit(department: System.Department) {
  openModal({ isUpdate: true, record: department })
}

async function handleSaved(result: DepartmentSaveResult) {
  await loadTree({
    fallbackId: result.parentId,
    preferredId: result.departmentId,
  })
}

async function handleDelete(department: System.Department) {
  if (actionLoading.value)
    return

  const fallbackId = getParentId(department.id)
  actionLoading.value = 'delete'
  try {
    await DepartmentApi.delete(department.id)
    window.$message?.success?.('删除成功')
    await loadTree({ fallbackId })
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    actionLoading.value = null
  }
}

async function handleToggleStatus(department: System.Department) {
  if (actionLoading.value)
    return

  const nextStatus = department.status === 1 ? 0 : 1
  actionLoading.value = 'status'
  try {
    if (nextStatus === 0)
      await DepartmentApi.disable(department.id)
    else
      await DepartmentApi.enable(department.id)

    updateTreeNodeStatus(department.id, nextStatus)
    window.$message?.success?.(nextStatus === 0 ? '已禁用' : '已启用')
    await retryDetail()
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    actionLoading.value = null
  }
}

watch(includeChildren, (value) => {
  localStorage.setItem('dept_includeChildren', String(value))
})

onMounted(() => {
  void loadTree()
})
</script>

<template>
  <main class="department-page">
    <DepartmentTreePanel
      :data="treeData"
      :error="treeError"
      :expanded-keys="expandedKeys"
      :loading="treeLoading"
      :selected-keys="selectedKeys"
      @add="handleAdd"
      @retry="loadTree()"
      @select="selectDepartment"
      @update:expanded-keys="expandedKeys = $event"
    />

    <DepartmentDetailPanel
      v-model:include-children="includeChildren"
      :action-loading="actionLoading"
      :department="selectedDept"
      :direct-child-count="directChildCount"
      :error="detailError"
      :loading="detailLoading"
      @add-child="handleAddChild"
      @delete="handleDelete"
      @edit="handleEdit"
      @retry="retryDetail"
      @toggle-status="handleToggleStatus"
    >
      <DepartmentMembersTable
        v-if="selectedDeptId"
        :department-id="selectedDeptId"
        :include-children="includeChildren"
      />
    </DepartmentDetailPanel>

    <DepartmentModal @register="registerModal" @success="handleSaved" />
  </main>
</template>

<style lang="scss" scoped>
.department-page {
  height: 100%;
  min-width: 0;
  display: flex;
  gap: 16px;
}

@media (max-width: 1024px) {
  .department-page {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .department-page {
    height: auto;
    min-height: 100%;
    flex-direction: column;
  }
}
</style>
