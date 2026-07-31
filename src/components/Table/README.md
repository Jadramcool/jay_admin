# Table 表格组件

## 组件用途与适用场景

`BasicTable` 是基于 Naive UI `NDataTable` 的业务表格封装，统一提供远程请求、分页、本地分页、加载状态、列设置、表格尺寸、刷新、新增和批量删除入口。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { BasicTable } from '@/components/Table'

interface UserRow {
  id: number
  username: string
}

const columns: DataTableColumns<UserRow> = [
  { title: '用户名', key: 'username' },
]

const request = async (params: Record<string, unknown>) => {
  return { list: [], pagination: { page: 1, pageSize: 10, total: 0 }, params }
}
</script>

<template>
  <BasicTable :columns="columns" :request="request" row-key="id" />
</template>
```

## Props

除下列封装属性外，其余属性透传给 `NDataTable`。

| Prop | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | `undefined` | 否 | 卡片标题 |
| `columns` | `DataTableColumns` | `[]` | 是 | 表格列配置 |
| `request` | `(params) => Promise<unknown>` | `null` | 否 | 数据请求函数 |
| `filters` | `Recordable` | `{}` | 否 | 请求过滤条件 |
| `rowKey` | `string \| (row) => string` | `undefined` | 否 | 行唯一键；选择和树展开场景必须配置 |
| `pagination` | `object \| boolean` | `{}` | 否 | 分页配置；设为 `false` 关闭分页 |
| `data` | `unknown[]` | `[]` | 否 | 静态数据 |
| `autoLoad` | `boolean` | `true` | 否 | 挂载后是否自动请求 |
| `localPagination` | `boolean` | `false` | 否 | 是否一次请求全部数据并在前端分页 |
| `showToolbar` | `boolean` | `true` | 否 | 是否显示工具栏区域 |
| `showAddBtn` | `boolean` | `true` | 否 | 是否显示新增按钮 |
| `showBatchDeleteBtn` | `boolean` | `false` | 否 | 是否显示批量删除按钮 |
| `showColumnsSetting` | `boolean` | `true` | 否 | 是否显示列设置 |
| `headerNoWrap` | `boolean` | `true` | 否 | 表头是否禁止换行 |
| `paginationFixedBottom` | `boolean` | `true` | 否 | 是否使用固定底部分页布局 |
| `size` | `'small' \| 'medium' \| 'large'` | 全局表格设置 | 否 | 表格尺寸；运行时会被全局表格尺寸覆盖 |

## Request 与响应约定

远程分页时，组件把分页参数和 `filters` 合并后传给 `request`。默认分页字段为 `page`、`pageSize`，响应支持：

```ts
interface TableResponse<T> {
  list: T[]
  pagination?: {
    page?: number
    pageSize?: number
    page_size?: number
    total?: number
    itemCount?: number
  }
}
```

也可直接返回数组。`localPagination=true` 时，组件会以大页尺寸请求一次并在前端切片。

## Events

| Event | 参数 | 说明 |
| --- | --- | --- |
| `add` | 无 | 点击工具栏新增按钮 |
| `batchDelete` | `keys: unknown[]` | 点击批量删除按钮，参数为当前选中行键 |
| `update:checkedRowKeys` | `keys: unknown[]` | 行选择变化，可用于 `v-model:checked-row-keys` |

## Slots

| Slot | 说明 |
| --- | --- |
| `header` | 完全替换卡片头部标题 |
| `header-extra` | 追加到工具栏之后的头部扩展区 |
| `toolbar` | 插入工具栏内、内置按钮之前 |
| `card-footer` | 卡片底部内容 |
| `empty` | 自定义空状态 |
| `loading` | 自定义表格加载内容 |

## 暴露方法

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `reload` | `(options?: Recordable) => Promise<void>` | 重新请求数据，可传分页覆盖参数 |
| `setPagination` | `(pagination: Recordable) => void` | 合并更新分页状态 |

```vue
<script setup lang="ts">
import { BasicTable } from '@/components/Table'

const tableRef = shallowRef<{
  reload: (options?: Record<string, unknown>) => Promise<void>
  setPagination: (options: Record<string, unknown>) => void
} | null>(null)

const reloadFirstPage = async () => {
  tableRef.value?.setPagination({ page: 1 })
  await tableRef.value?.reload({ page: 1 })
}
</script>

<template>
  <BasicTable ref="tableRef" :columns="[]" />
</template>
```

## 默认行为和关键交互

- `autoLoad=true` 且提供 `request` 时，挂载后自动加载。
- 改变远程分页页码或每页数量会重新请求；本地分页只切换当前数据切片。
- 刷新按钮调用 `reload()`。
- 列设置支持显示隐藏、拖拽排序和恢复默认。
- 表格尺寸由全局表格设置统一管理，工具栏尺寸切换会影响所有 `BasicTable`。
- `defaultExpandAll=true` 时，数据加载后会根据 `rowKey` 递归展开树形数据。

## 完整业务示例

```vue
<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { BasicTable, FormQuery, useForm } from '@/components'

const filters = reactive({ keyword: '' })
const tableRef = shallowRef<{ reload: () => Promise<void> } | null>(null)

const columns: DataTableColumns = [
  { type: 'selection' },
  { title: '名称', key: 'name' },
]

const [registerForm] = useForm({
  schemas: [{ field: 'keyword', label: '名称', component: 'NInput' }],
  tableRef,
})

const handleSearch = async (values: Record<string, unknown>) => {
  Object.assign(filters, values)
  await tableRef.value?.reload()
}

const request = async (params: Record<string, unknown>) => ({
  list: [],
  pagination: { page: 1, pageSize: 10, total: 0 },
  params,
})
</script>

<template>
  <FormQuery @register="registerForm" @submit="handleSearch" />
  <BasicTable
    ref="tableRef"
    :columns="columns"
    :filters="filters"
    :request="request"
    row-key="id"
    show-batch-delete-btn
  />
</template>
```

## 注意事项及不推荐用法

- 有选择列、树形数据或批量操作时必须提供稳定 `rowKey`，不要使用数组下标。
- 远程请求应返回数组或 `{ list, pagination }`，不要让页面直接修改表格内部数据源。
- 查询条件变化后由业务代码明确调用 `reload()`，不要依赖深度监听自动请求。
- `request` 内的错误会被组件捕获并记录；业务提示应由统一请求层处理。

