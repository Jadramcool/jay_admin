<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { SettingsApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModal } from '@/components/Modal'
import { invalidatePublicSettings } from '@/composables/usePublicSettings'
import HistoryDrawer from './components/HistoryDrawer.vue'
import SettingModal from './components/SettingModal.vue'
import { useSettingSchema } from './schema'

/**
 * 系统设置(注册表驱动,沿用管理端既有列表结构)。
 *
 * 页面 = 查询表单 + 表格 + 编辑弹窗 + 历史抽屉;
 * 列/筛选项/值控件都由后端注册表元数据渲染,新增设置项时前端不需要改动。
 * 设置项数量受注册表约束(个位数到几十),所以一次拉全量后在本地做筛选/排序/分页。
 */
interface TableInstance {
  reload: (options?: Record<string, unknown>) => Promise<void>
}

type SchemaItem = System.SettingSchema['groups'][number]['items'][number]

const tableRef = shallowRef<TableInstance | null>(null)
const [registerModal, { openModal }] = useModal()

const rows = ref<System.SettingView[]>([])
const schemaItems = ref(new Map<string, SchemaItem>())
const groupOptions = ref<{ label: string, value: string }[]>([])
const loaded = ref(false)
let inflight: Promise<void> | null = null

// 历史抽屉:token 每次点击自增,保证同一个设置项也能重新打开
const historyToken = ref(0)
const historyKey = ref('')
const historyLabel = ref('')

const schemaMethods = {
  handleEdit(row: System.SettingView) {
    openModal({ row, meta: schemaItems.value.get(row.key) })
  },
  handleHistory(row: System.SettingView) {
    historyKey.value = row.key
    historyLabel.value = row.label
    historyToken.value += 1
  },
  async handleReset(row: System.SettingView) {
    await SettingsApi.reset(row.key, {
      expectedVersion: row.version || undefined,
      reason: '重置为默认值',
    })
    invalidatePublicSettings()
    window.$message?.success?.('已重置为默认值')
    await refresh()
  },
}

const { columns, formSchemas } = useSettingSchema(schemaMethods, groupOptions)
const [registerForm, { getFieldsValue }] = useForm({
  gridProps: { cols: '1 s:1 m:2 l:3 xl:4' },
  schemas: formSchemas,
  submitOnReset: true,
  tableRef,
})

/** 拉取注册表元数据 + 全部设置项(两者一次并行取回) */
async function fetchAll() {
  const [schemaRes, listRes] = await Promise.all([
    SettingsApi.getSchema(),
    SettingsApi.list(),
  ])
  groupOptions.value = schemaRes.groups.map(group => ({
    label: group.group,
    value: group.group,
  }))
  schemaItems.value = new Map(
    schemaRes.groups
      .flatMap(group => group.items)
      .map(item => [item.key, item] as [string, SchemaItem]),
  )
  rows.value = listRes ?? []
  loaded.value = true
}

function ensureLoaded() {
  if (loaded.value)
    return Promise.resolve()
  inflight ??= fetchAll().finally(() => {
    inflight = null
  })
  return inflight
}

/** BasicTable 的取数函数:本地筛选/排序/分页,不再打后端 */
async function loadData(params: Api.PageParams) {
  await ensureLoaded()

  const query = getFieldsValue() as Record<string, string>
  let list = rows.value.filter((row) => {
    if (query.label && !row.label.includes(query.label))
      return false
    if (query.key && !row.key.includes(query.key))
      return false
    if (query.group && row.group !== query.group)
      return false
    if (query.type && row.type !== query.type)
      return false
    if (query.source && row.source !== query.source)
      return false
    return true
  })

  if (params.sortField && params.sortOrder) {
    const direction = params.sortOrder === 'asc' ? 1 : -1
    list = [...list].sort(
      (a, b) =>
        compareValue(
          (a as Record<string, unknown>)[params.sortField as string],
          (b as Record<string, unknown>)[params.sortField as string],
        ) * direction,
    )
  }

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  return {
    items: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length,
    page,
    pageSize,
  }
}

function compareValue(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number')
    return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

async function reload() {
  await tableRef.value?.reload()
}

/** 写入后强制重新拉取(注册表元数据与生效值都可能变) */
async function refresh() {
  loaded.value = false
  await reload()
}

onMounted(ensureLoaded)
</script>

<template>
  <div class="system-page">
    <FormQuery @register="registerForm" @submit="reload" />
    <BasicTable
      ref="tableRef" title="系统设置" :columns="columns" :request="loadData"
      :row-key="(row: System.SettingView) => row.key" :show-add-btn="false" :show-batch-delete-btn="false"
      :scroll-x="1800"
    />

    <SettingModal @register="registerModal" @success="refresh" />
    <HistoryDrawer :token="historyToken" :setting-key="historyKey" :label="historyLabel" @changed="refresh" />
  </div>
</template>
