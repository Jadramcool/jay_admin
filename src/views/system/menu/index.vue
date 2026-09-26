<script setup lang="ts">
import type { MenuTreeFilters } from './menu-tree'
import { MenuApi } from '@/api/system'
import { useForm, useModal } from '@/components/index.ts'
import { DEFAULT_PLATFORM, enabledPlatformOptions } from '@/constants'
import { hasPermission } from '@/utils/common/hasPermission'
import MenuModal from './components/MenuModal.vue'
import { filterMenuTree } from './menu-tree'
import { useMenuSchema } from './schema'

const tableRef = ref<any>(null)
const [registerModal, { openModal }] = useModal()
/** 当前端：菜单与按钮按端隔离，切换后只展示与管理该端 */
const activePlatform = ref(DEFAULT_PLATFORM)

const schemaMethods = {
  handleEdit(row: any) {
    openModal({
      record: row,
      isUpdate: true,
      platform: row.platform ?? activePlatform.value,
    })
  },
  handleDelete(row: any) {
    window.$dialog?.warning({
      title: '提示',
      content: `确定要删除菜单「${row.name}」吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await MenuApi.delete(row.id)
          window.$message?.success?.('删除成功')
          reload()
        }
        catch {
          /* handled by interceptor */
        }
      },
    })
  },
  handleAddChild(row: any) {
    openModal({
      record: { pid: row.id },
      isUpdate: false,
      platform: row.platform ?? activePlatform.value,
    })
  },
}

const { columns, formSchemas } = useMenuSchema(schemaMethods)

const [register, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

/**
 * 全量树 + 本地过滤
 *
 * 菜单树必须一次取全：只有父链完整才能拼出正确层级。此前用分页接口 + arrayToTree，
 * 父节点不在当前页的子节点会被提升为根节点（默认 20 条/页时 20 行里有 17 行成了假根），
 * 展示出来的并不是真实的树。当前规模约 60 行，筛选改在前端做，
 * 命中子节点时保留父链，便于直接看到它挂在哪个页面下。
 *
 * 按端查询：不同端的菜单/按钮互不可见，子节点必须与父节点同端（后端强校验）。
 */
async function loadData() {
  const { keyword, typeFilter, statusFilter } = getFieldsValue() as {
    keyword?: string
    typeFilter?: System.Menu['type'] | null
    statusFilter?: 'enabled' | 'disabled' | null
  }
  const filters: MenuTreeFilters = {
    keyword,
    type: typeFilter,
    status: statusFilter,
  }
  const tree = await MenuApi.tree(activePlatform.value)
  return filterMenuTree(tree ?? [], filters)
}

function reload() {
  tableRef.value?.reload()
}

function handlePlatformChange(platform: string) {
  activePlatform.value = platform
  reload()
}

function handleAdd() {
  openModal({ isUpdate: false, platform: activePlatform.value })
}
</script>

<template>
  <div class="system-page">
    <FormQuery @register="register" @submit="reload" />
    <BasicTable
      ref="tableRef"
      title="菜单管理"
      :columns="columns"
      :request="loadData"
      :row-key="(row: any) => row.id"
      :show-add-btn="hasPermission('system:menu:create')"
      :pagination="false"
      :default-expand-all="true"
      :scroll-x="1700"
      @add="handleAdd"
    >
      <!-- 端切换放在列表标题左侧：菜单与按钮按端隔离 -->
      <template #header>
        <div class="menu-table-header">
          <span class="menu-table-header__title">菜单管理</span>
          <n-radio-group
            :value="activePlatform"
            size="small"
            @update:value="handlePlatformChange"
          >
            <n-radio-button
              v-for="option in enabledPlatformOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </n-radio-group>
        </div>
      </template>
    </BasicTable>

    <MenuModal @register="registerModal" @success="reload" />
  </div>
</template>

<style scoped lang="scss">
.menu-table-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-table-header__title {
  position: relative;
  padding-left: 12px;
  color: var(--card-header-text, #1f2329);
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.01em;
}

.menu-table-header__title::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--primary-color, #18a058);
  content: '';
  transform: translateY(-50%);
}
</style>
