# DictSelect 字典下拉

## 用途与适用场景

按**字典类型编码**渲染下拉框，选项取自「数据字典」模块（`数据字典` 菜单 → 字典类型 → 字典项）。
适合「取值必须受控、由管理员维护」的字段，例如性别、公告类型、系统配置分类。

对比同类组件：

| 组件         | 选项来源           | 适用场景                         |
| ------------ | ------------------ | -------------------------------- |
| `DictSelect` | 后端字典（可维护） | 取值需要统一管理、要显示中文标签 |
| `ApiSelect`  | 某个列表接口       | 选项来自业务表（用户、部门等）   |
| `NSelect`    | 写死在 schema 里   | 取值固定且极少变化               |

## 引入方式

```vue
<script setup lang="ts">
import { DictSelect } from '@/components/DictSelect'
</script>

<template>
  <DictSelect v-model:value="sex" code="sex" placeholder="请选择性别" />
</template>
```

在 schema 驱动的表单里使用（已注册进 `componentMap`，可直接写 `component: 'DictSelect'`）：

```ts
const categoryField = {
  key: 'category',
  label: '分类',
  form: {
    component: 'DictSelect',
    componentProps: { code: 'sys_config_category', placeholder: '请选择分类' },
  },
}
```

## Props

| 名称          | 类型                                                  | 默认值   | 必填 | 说明                                          |
| ------------- | ----------------------------------------------------- | -------- | ---- | --------------------------------------------- |
| `code`        | `string`                                              | —        | 是   | 字典类型编码，如 `sex`、`sys_config_category` |
| `value`       | `string \| number \| null \| Array<string \| number>` | `null`   | 否   | 当前值（配合 `v-model:value`）                |
| `multiple`    | `boolean`                                             | `false`  | 否   | 多选                                          |
| `clearable`   | `boolean`                                             | `true`   | 否   | 是否可清空                                    |
| `placeholder` | `string`                                              | `请选择` | 否   | 占位文案                                      |
| `disabled`    | `boolean`                                             | `false`  | 否   | 禁用                                          |
| `size`        | `'small' \| 'medium' \| 'large'`                      | `medium` | 否   | 尺寸                                          |

## Events

| 事件           | 参数  | 说明                                           |
| -------------- | ----- | ---------------------------------------------- |
| `update:value` | `any` | 选中值变化；选中项的 `value` 是字典项的 `code` |

## Slots

无。

## 暴露方法

无（直接使用 `ref` 拿到的是内部 `NSelect` 实例不作为公开 API）。

## 默认行为和关键交互

- **选项来源**：`useDictStore.getOptions(code)`，组件挂载时按 `code` 调 `getItems(code)` 加载，`code` 变化会重新加载。
- **只显示启用项**：字典项列表接口只返回 `status=1` 的项，停用的字典项不会出现在下拉里。
- **带缓存**：字典项缓存在 `useDictStore` 中（按 `code`）。「数据字典」页在新增/修改/删除/停用字典项后会主动调用 `useDictStore().clear(code)`，其它入口自行改字典数据时也必须失效缓存，否则已加载的页面会继续用旧选项。
- **未加载时为空**：首屏请求返回前选项数组为空，不会影响已选中的值。

## 注意事项及不推荐用法

- 不要把 `code` 当普通常量写到多个页面：类型编码由数据字典维护，拼错只会静默得到空选项，不会报错。
- 需要「允许输入字典外的值」时不要用本组件：`NSelect` 的 `tag` 模式不是本组件的公开能力，改动请先补充本文件。
- 不要绕过 `useDictStore` 直接调 `DictApi.getItemsByCode`，会失去缓存并重复请求。
