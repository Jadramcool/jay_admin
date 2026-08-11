# Form 表单组件

## 组件用途与适用场景

Form 组件族通过 `schemas` 描述字段，并统一处理布局、校验、提交、重置和命令式操作。

- `BasicForm`：完整基础实现，适合需要查询行为和高级展开能力的兼容场景。
- `FormQuery`：查询表单，默认提供查询、重置、展开/收起及表格联动。
- `FormEdit`：新增或编辑表单，默认提交文案为“保存”，支持字段插槽和初始化快照重置。
- `useForm`：父组件调用表单公开方法的配套组合式函数。

业务查询优先使用 `FormQuery`，新增或编辑优先使用 `FormEdit`。除非维护旧页面，不建议新代码直接使用 `BasicForm`。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import { FormQuery, useForm } from '@/components/Form'

const schemas = [
  {
    field: 'keyword',
    label: '关键词',
    component: 'NInput',
    componentProps: { placeholder: '请输入关键词' },
  },
]

const [registerForm] = useForm({ schemas })

function handleSubmit(values: Record<string, unknown>) {
  console.log(values)
}
</script>

<template>
  <FormQuery @register="registerForm" @submit="handleSubmit" />
</template>
```

## Schema

| 字段             | 类型                                         | 必填 | 说明                                            |
| ---------------- | -------------------------------------------- | ---- | ----------------------------------------------- |
| `field`          | `string`                                     | 是   | 表单字段名，也是校验和命令式赋值的键            |
| `label`          | `string`                                     | 否   | 标签文字                                        |
| `defaultValue`   | `unknown`                                    | 否   | 初始默认值；查询表单重置时恢复此值              |
| `component`      | `ComponentType`                              | 否   | 渲染组件类型                                    |
| `componentProps` | `Recordable \| (context) => Recordable`      | 否   | 组件属性；函数参数包含 `schema`、`formModel`    |
| `componentSlots` | `Recordable`                                 | 否   | 传给字段组件的插槽配置                          |
| `slot`           | `string`                                     | 否   | `FormEdit` 自定义字段插槽名称                   |
| `rules`          | `FormItemRule[]`                             | 否   | Naive UI 校验规则                               |
| `giProps`        | `GridItemProps`                              | 否   | 当前字段的 `NGi` 配置                           |
| `ifShow`         | `boolean \| ({ values, schema }) => boolean` | 否   | 是否显示字段                                    |
| `isFull`         | `boolean`                                    | 否   | 当前字段组件是否撑满                            |
| `suffix`         | `string`                                     | 否   | 字段尾部内容                                    |
| `query`          | `'in' \| 'not_in'`                           | 否   | 查询提交时转换为 `field__in` 或 `field__not_in` |

当前注册的 `component` 包括：`NInput`、`NInputNumber`、`NSelect`、`NCheckbox`、`NCheckboxGroup`、`NRadioGroup`、`NSwitch`、`NDatePicker`、`NTimePicker`、`NTreeSelect`、`NCascader`、`NTransfer`、`ApiSelect`、`ApiTreeSelect`、`ApiTree`、`IconPicker`、`RadioButtonGroup`。

`ApiTreeSelect` 使用 `api(params)` 加载树数据，默认读取 `name`、`id`、`children` 和 `disabled` 字段。可分别通过 `labelField`、`keyField`、`childrenField`、`disabledField` 修改字段映射；业务侧需要禁止选择某个节点时，应在接口结果中为该节点设置对应禁用字段，而不是操作组件内部选项。

## Props

三个表单均会把未消费的表单属性透传给 Naive UI `NForm`。下表列出公共封装属性。

| Prop                    | 类型                             | 默认值                                   | 说明                                                                          |
| ----------------------- | -------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `schemas`               | `FormSchema[]`                   | `[]`                                     | 字段配置                                                                      |
| `gridProps`             | `GridProps`                      | 组件相关                                 | `NGrid` 配置                                                                  |
| `giProps`               | `GridItemProps`                  | `null`                                   | 字段默认 `NGi` 配置；`FormQuery` 支持                                         |
| `labelWidth`            | `number \| string`               | `'auto'`                                 | 标签宽度                                                                      |
| `labelAlign`            | `string`                         | `'right'`                                | 标签对齐方式                                                                  |
| `labelPlacement`        | `string`                         | `'left'`                                 | 标签位置                                                                      |
| `size`                  | `'small' \| 'medium' \| 'large'` | `'medium'`                               | 表单尺寸                                                                      |
| `layout`                | `string`                         | 查询为 `'inline'`，编辑为 `'horizontal'` | 布局模式                                                                      |
| `isFull`                | `boolean`                        | `true`                                   | 字段组件是否默认撑满                                                          |
| `showActionButtonGroup` | `boolean`                        | `true`                                   | 是否显示操作按钮组                                                            |
| `showSubmitButton`      | `boolean`                        | `true`                                   | 是否显示提交按钮                                                              |
| `showResetButton`       | `boolean`                        | 查询为 `true`，编辑为 `false`            | 是否显示重置按钮                                                              |
| `submitButtonText`      | `string`                         | 查询为 `'查询'`，编辑为 `'保存'`         | 提交按钮文字                                                                  |
| `resetButtonText`       | `string`                         | `'重置'`                                 | 重置按钮文字                                                                  |
| `submitFunc`            | `() => Promise<void>`            | `null`                                   | 完全接管默认提交行为                                                          |
| `resetFunc`             | `() => Promise<void>`            | `null`                                   | `FormQuery`/`FormEdit` 中完全接管默认重置行为；`BasicForm` 当前仅保留兼容属性 |

`FormQuery`/`BasicForm` 还支持：

| Prop                  | 类型         | 默认值 | 说明                                   |
| --------------------- | ------------ | ------ | -------------------------------------- |
| `submitOnReset`       | `boolean`    | `true` | 重置后是否触发 `submit`                |
| `resetPageOnReset`    | `boolean`    | `true` | 重置时是否将关联表格恢复到第一页并刷新 |
| `tableRef`            | `object`     | `null` | 关联的 `BasicTable` 实例               |
| `showAdvancedButton`  | `boolean`    | `true` | 超过三个字段时是否显示展开/收起        |
| `submitButtonOptions` | `Recordable` | `null` | 提交按钮附加属性                       |
| `resetButtonOptions`  | `Recordable` | `null` | 重置按钮附加属性                       |

`FormEdit` 还支持 `loadingSub: boolean`，默认 `false`，用于控制提交按钮加载状态。

## Events

| Event      | 参数                 | 说明                                                             |
| ---------- | -------------------- | ---------------------------------------------------------------- |
| `register` | `FormActionType`     | 组件挂载后注册公开方法；通常直接绑定 `useForm` 返回的 `register` |
| `submit`   | `values: Recordable` | 默认校验通过后触发                                               |
| `reset`    | `values: Recordable` | 默认重置完成后触发                                               |

使用 `submitFunc`，或在 `FormQuery`/`FormEdit` 使用 `resetFunc` 时，自定义函数会接管对应默认流程，组件不会继续执行默认 emit、校验或重置逻辑。`BasicForm` 当前不会调用 `resetFunc`，新页面应优先使用 `FormQuery` 或 `FormEdit`。

## Slots

`FormEdit` 支持按 schema 的 `slot` 字段声明具名插槽：

```vue
<FormEdit @register="registerForm">
  <template #avatar="{ model, field, schema }">
    <AvatarUploader v-model="model[field]" :title="schema.label" />
  </template>
</FormEdit>
```

插槽参数：

| 参数     | 说明                |
| -------- | ------------------- |
| `model`  | 当前响应式表单模型  |
| `field`  | 当前字段名          |
| `schema` | 当前字段完整 schema |

`BasicForm` 和 `FormQuery` 当前不提供字段级外部插槽，请通过 `component`、`componentProps` 或现有自定义字段组件实现。

## 暴露方法与 useForm

```ts
const [registerForm, formMethods] = useForm({ schemas })

await formMethods.setFieldsValue({ name: '张三' })
const values = formMethods.getFieldsValue<Record<string, unknown>>()
await formMethods.validate()
await formMethods.resetFields()
```

| 方法                   | 签名                                             | 说明                                                     |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `setProps`             | `(props) => Promise<void>`                       | 动态合并表单属性                                         |
| `getFieldsValue`       | `<T>() => T`                                     | 获取当前值；查询表单会过滤空值并处理查询后缀             |
| `setFieldsValue`       | `(values) => Promise<void>`                      | 只设置 schema 中存在的字段                               |
| `resetFields`          | `() => Promise<void>`                            | 执行组件默认重置                                         |
| `clearValidate`        | `(name?) => Promise<void>`                       | 清除校验状态；当前实现会清除整个表单                     |
| `validate`             | `() => Promise<unknown>`                         | 校验整个表单                                             |
| `validateFields`       | `(name: string \| string[]) => Promise<unknown>` | 校验指定字段                                             |
| `updateSchema`         | `(schema \| schema[]) => Promise<void>`          | 按 `field` 合并更新 schema                               |
| `submit`               | `() => Promise<unknown>`                         | 主动触发提交流程                                         |
| `getComponentInstance` | `(field) => unknown`                             | 获取字段组件实例；仅组件暴露对象提供，`useForm` 暂未代理 |

## 默认行为和关键交互

### FormQuery / BasicForm 重置

- 恢复 schema 的 `defaultValue`，没有默认值的已有字段设为 `null`。
- 清除校验并触发 `reset`。
- `submitOnReset=true` 时继续触发 `submit`。
- 配置 `tableRef` 且 `resetPageOnReset=true` 时，将页码设为 1 并调用表格 `reload()`。

### FormEdit 重置

- `showResetButton=true` 时，每次调用 `setFieldsValue()` 后会深拷贝当前完整模型作为初始化快照。
- 点击默认重置按钮或调用 `resetFields()` 时恢复该初始化快照，不会清空编辑接口回填的数据。
- 未形成初始化快照时，恢复 schema 的 `defaultValue`。
- `showResetButton=false` 的复用 Modal 不保存编辑快照，仍可在每次打开时调用 `resetFields()` 清理旧数据。

## 完整业务示例

```vue
<script setup lang="ts">
import { FormEdit, useForm } from '@/components/Form'

const schemas = [
  { field: 'id', label: 'ID', component: 'NInput', ifShow: false },
  {
    field: 'name',
    label: '名称',
    component: 'NInput',
    rules: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  },
  {
    field: 'status',
    label: '状态',
    component: 'NSwitch',
    defaultValue: true,
  },
]

const [registerForm, { setFieldsValue }] = useForm({
  schemas,
  showResetButton: true,
})

onMounted(async () => {
  const detail = await Promise.resolve({ id: 1, name: '示例', status: true })
  await setFieldsValue(detail)
})

async function handleSubmit(values: Record<string, unknown>) {
  await Promise.resolve(values)
}
</script>

<template>
  <FormEdit
    show-reset-button
    @register="registerForm"
    @submit="handleSubmit"
  />
</template>
```

## 注意事项及不推荐用法

- 不要直接读取或修改组件内部 `formModel`，统一使用 `useForm` 方法或 `FormEdit` 作用域插槽。
- 不要向 `setFieldsValue` 传入未在 schema 声明的字段；这些字段会被忽略。
- 查询条件与表格请求联动时，优先通过 `@submit="reload"` 和 `tableRef` 完成，不要从 DOM 获取输入值。
- `FormQuery`/`FormEdit` 的 `resetFunc` 以及所有表单的 `submitFunc` 是完全接管，不是默认流程前后的钩子。
