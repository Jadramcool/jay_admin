# Description 描述列表组件

## 组件用途与适用场景

`Description` 基于 Naive UI `NDescriptions`，通过 schema 统一渲染详情字段，适用于用户详情、日志详情、公告详情等只读信息展示。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import { Description } from '@/components'

const data = { username: 'admin', status: '正常' }
const schemas = [
  { field: 'username', label: '用户名' },
  { field: 'status', label: '状态' },
]
</script>

<template>
  <Description :data="data" :schemas="schemas" />
</template>
```

## Props

组件继承 `NDescriptions` 的属性，并增加以下封装属性。

| Prop                 | 类型                             | 默认值    | 说明                                    |
| -------------------- | -------------------------------- | --------- | --------------------------------------- |
| `schemas`            | `DescriptionItem[]`              | `[]`      | 描述项配置                              |
| `data`               | `Recordable`                     | `{}`      | 展示数据                                |
| `column`             | `number`                         | `3`       | 兼容传入的列配置                        |
| `descriptionColumns` | `number`                         | `3`       | 实际传给 `NDescriptions.columns` 的列数 |
| `labelPlacement`     | `'top' \| 'left'`                | `'left'`  | 标签位置                                |
| `labelWidth`         | `number \| string`               | `100`     | 标签宽度                                |
| `size`               | `'small' \| 'medium' \| 'large'` | `'small'` | 尺寸                                    |
| `bordered`           | `boolean`                        | `false`   | 是否显示边框                            |

### DescriptionItem

| 字段        | 类型                   | 必填 | 说明                     |
| ----------- | ---------------------- | ---- | ------------------------ |
| `field`     | `string`               | 是   | 数据字段；空字段不会渲染 |
| `label`     | `string`               | 是   | 标签文字                 |
| `span`      | `number`               | 否   | 当前项跨列数，默认 1     |
| `labelBold` | `boolean`              | 否   | 标签是否加粗             |
| `valueBold` | `boolean`              | 否   | 值是否加粗               |
| `render`    | `(data) => VNodeChild` | 否   | 自定义渲染函数           |

## Events

组件没有自定义 Events。Naive UI 描述列表相关属性通过 Props 传入。

## Slots

组件当前不提供外部 Slots。需要自定义某一字段时使用 schema 的 `render`。

## 自定义渲染示例

```vue
<script setup lang="ts">
import { NTag } from 'naive-ui'
import { h } from 'vue'
import { Description } from '@/components'

const data = { status: 1 }
const schemas = [
  {
    field: 'status',
    label: '状态',
    render: (row: typeof data) => h(
      NTag,
      { type: row.status === 1 ? 'success' : 'error' },
      { default: () => row.status === 1 ? '正常' : '停用' },
    ),
  },
]
</script>

<template>
  <Description :data="data" :schemas="schemas" />
</template>
```

## 默认行为和关键交互

- 没有 `render` 时读取 `data[field]`。
- 值为 `null` 或 `undefined` 时显示 `-`；`0`、`false` 和空字符串会按原值显示。
- `render` 会作为函数式组件接收完整 `data`。

## 注意事项及不推荐用法

- schema 的 `field` 必须稳定且唯一。
- 简单格式化优先在 `render` 中完成，不要通过 DOM 查询后替换文本。
- 大段复杂内容应拆为专用详情组件，不要把所有业务逻辑堆进 `render`。
