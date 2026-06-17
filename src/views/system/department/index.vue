<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { nextTick, ref } from 'vue'
import { DepartmentApi } from '@/api/system'
import DepartmentModal from './components/DepartmentModal.vue'
import { useMemberSchema } from './member-schema'
import { useDepartmentSchema } from './schema'

useDepartmentSchema()
const { columns: memberColumns } = useMemberSchema()

// ---------- state ----------
const treeData = ref<any[]>([])
const treeLoading = ref(false)
const selectedKeys = ref<number[]>([])
const selectedDept = ref<System.Department | null>(null)
const searchKeyword = ref('')

const includeChildren = ref(localStorage.getItem('dept_includeChildren') === 'true')

const tableRef = ref<any>(null)
const [registerModal, { openModal }] = useModal()

// ---------- tree ----------
const expandedKeys = ref<number[]>([])

const selectedDeptId = ref<number | null>(null)

async function loadTree() {
  treeLoading.value = true
  try {
    const res = await DepartmentApi.tree()
    const nodes = (res || []).map(formatTreeNode)
    treeData.value = nodes
    expandedKeys.value = nodes.map((n: any) => n.key)
    // 默认选中第一个根节点（总公司）
    if (nodes.length > 0) {
      selectedKeys.value = [nodes[0].key]
      selectedDeptId.value = nodes[0].key
      await loadDeptDetail(nodes[0].key)
      nextTick(() => tableRef.value?.reload())
    }
  }
  finally {
    treeLoading.value = false
  }
}

function formatTreeNode(item: any): any {
  return {
    label: item.name,
    code: item.code,
    key: item.id,
    isLeaf: !item.children || item.children.length === 0,
    children: item.children ? item.children.map(formatTreeNode) : undefined,
  }
}

function renderLabel(info: {
  option: any
  selected: boolean
  checked: boolean
}) {
  return h('div', { style: 'line-height:1.4;' }, [
    h('div', { class: 'tree-node-name text-sm' }, info.option.label),
    h('span', { class: 'tree-node-code text-xs' }, info.option.code),
  ])
}

function nodeProps(_option: { option: any }) {
  return {
    style: {
      cursor: 'pointer',
      padding: '2px 0',
    },
  }
}

async function onTreeSelect(keys: number[]) {
  if (!keys.length)
    return
  selectedKeys.value = keys
  selectedDeptId.value = keys[0]
  await loadDeptDetail(keys[0])
  nextTick(() => tableRef.value?.reload())
}

async function loadDeptDetail(id: number) {
  try {
    selectedDept.value = await DepartmentApi.detail(id)
  }
  catch {
    selectedDept.value = null
  }
}

async function loadMembers(params: any) {
  const id = selectedDeptId.value
  if (!id)
    return { list: [], pagination: { page: 1, pageSize: 10, total: 0 } }
  return DepartmentApi.members(id, {
    ...params,
    includeChildren: includeChildren.value,
  })
}

function onIncludeChildrenChange() {
  localStorage.setItem('dept_includeChildren', String(includeChildren.value))
  if (selectedDeptId.value)
    nextTick(() => tableRef.value?.reload())
}

// ---------- search ----------
let searchTimer: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // tree uses :pattern prop for filtering, no extra logic needed
  }, 300)
}

// ---------- actions ----------
function handleAdd() {
  openModal({ isUpdate: false })
}

function handleAddChild(dept: System.Department) {
  openModal({ record: { parentId: dept.id }, isUpdate: false })
}

function handleEdit(dept: System.Department) {
  openModal({ record: dept, isUpdate: true })
}

async function handleDelete(dept: System.Department) {
  try {
    await DepartmentApi.delete(dept.id)
    window.$message?.success?.('删除成功')
    selectedDept.value = null
    selectedKeys.value = []
    loadTree()
  }
  catch {
    /* handled by interceptor */
  }
}

async function handleToggleStatus(dept: System.Department) {
  try {
    if (dept.status === 1) {
      await DepartmentApi.disable(dept.id)
    }
    else {
      await DepartmentApi.enable(dept.id)
    }
    window.$message?.success?.(dept.status === 1 ? '已禁用' : '已启用')
    loadDeptDetail(dept.id)
    loadTree()
  }
  catch {
    /* handled by interceptor */
  }
}

function getDeptIcon(code: string) {
  const map: Record<string, string> = {
    HQ: 'mdi:domain',
    IT: 'mdi:laptop',
    MARKETING: 'mdi:bullhorn',
    FINANCE: 'mdi:currency-usd',
    HR: 'mdi:account-group',
    OPERATIONS: 'mdi:cog',
    R_D: 'mdi:flask',
  }
  return map[code] || 'mdi:folder-outline'
}

// ---------- init ----------
onMounted(() => {
  loadTree()
})
</script>

<template>
  <div class="dept-page">
    <!-- 左侧部门树 -->
    <div class="dept-tree-panel">
      <div class="dept-tree-header">
        <span class="dept-tree-title text-base">部门结构</span>
        <n-button size="small" circle type="primary" @click="handleAdd">
          <template #icon>
            <Icon icon="mdi:plus" width="16" />
          </template>
        </n-button>
      </div>
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索部门"
        clearable
        size="small"
        class="dept-search"
        @input="handleSearch"
      />
      <n-spin :show="treeLoading" class="dept-tree-spin">
        <n-tree
          :data="treeData"
          :selected-keys="selectedKeys"
          :pattern="searchKeyword"
          :render-label="renderLabel"
          :expanded-keys="expandedKeys"
          block-line
          block-node
          :node-props="nodeProps"
          @update:selected-keys="onTreeSelect"
          @update:expanded-keys="expandedKeys = $event"
        />
      </n-spin>
    </div>

    <!-- 右侧员工面板 -->
    <div class="dept-content-panel">
      <template v-if="selectedDept">
        <div class="dept-content-header">
          <div class="dept-content-title text-lg">
            <Icon :icon="getDeptIcon(selectedDept.code)" width="22" />
            <span>{{ selectedDept.name }}</span>
            <n-tag size="small" :bordered="false" type="info">
              {{ selectedDept.code }}
            </n-tag>
            <n-tag
              size="small"
              :bordered="false"
              :type="selectedDept.status === 1 ? 'success' : 'warning'"
            >
              {{ selectedDept.status === 1 ? "启用" : "禁用" }}
            </n-tag>
          </div>
          <n-space>
            <n-button size="small" @click="handleEdit(selectedDept)">
              编辑部门
            </n-button>
            <n-button size="small" @click="handleAddChild(selectedDept)">
              添加子部门
            </n-button>
            <n-button
              size="small"
              :type="selectedDept.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(selectedDept)"
            >
              {{ selectedDept.status === 1 ? "禁用" : "启用" }}
            </n-button>
            <n-popconfirm @positive-click="handleDelete(selectedDept)">
              <template #trigger>
                <n-button size="small" type="error">
                  删除
                </n-button>
              </template>
              确定要删除部门「{{ selectedDept.name }}」吗？
            </n-popconfirm>
          </n-space>
        </div>

        <div class="dept-stats text-sm">
          <span v-if="selectedDept">共 {{ selectedDept.children?.length || 0 }} 个子部门</span>
          <label class="include-children-toggle">
            <n-switch
              v-model:value="includeChildren"
              size="small"
              @update:value="onIncludeChildrenChange"
            />
            <span class="toggle-label text-xs">包含子部门</span>
          </label>
        </div>

        <BasicTable
          ref="tableRef"
          :columns="memberColumns"
          :request="loadMembers"
          :row-key="(row: any) => row.id"
          :show-toolbar="false"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </template>

      <div v-else class="dept-empty text-sm">
        <Icon
          icon="mdi:folder-open-outline"
          width="64"
          color="var(--card-empty-text)"
        />
        <p>请从左侧选择一个部门</p>
      </div>
    </div>

    <DepartmentModal @register="registerModal" @success="loadTree" />
  </div>
</template>

<style lang="scss" scoped>
.dept-page {
  display: flex;
  height: 100%;
  gap: 16px;
}

.dept-tree-panel {
  width: 280px;
  min-width: 280px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dept-tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px;
}

.dept-tree-title {
  font-weight: 600;
  color: var(--card-header-text);
}

.dept-search {
  margin: 8px 12px;
  width: auto;
}

.dept-tree-spin {
  flex: 1;
  overflow: auto;
  padding: 4px 8px 12px;
}

/* ---------- right panel ---------- */
.dept-content-panel {
  flex: 1;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--card-border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dept-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.dept-content-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--card-header-text);
}

.dept-stats {
  color: var(--card-sub-text);
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--card-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.include-children-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.toggle-label {
  color: var(--card-toggle-text);
}

.dept-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--card-empty-text);
}

:deep(.role-tag) {
  display: inline-block;
  background: var(--role-tag-bg);
  color: var(--role-tag-text);
  padding: 1px 8px;
  border-radius: 4px;
  margin: 1px 3px 1px 0;
}
</style>
