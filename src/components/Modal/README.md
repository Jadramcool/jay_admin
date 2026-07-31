# Modal 弹窗组件

## 组件用途与适用场景

`BasicModal` 封装 Naive UI `NModal` 与 `NCard`，提供统一标题、滚动内容、加载状态、底部按钮、关闭拦截以及 `useModal`/`useModalInner` 命令式调用。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import { BasicModal, useModal } from '@/components/Modal'

const [registerModal, { openModal, closeModal }] = useModal()

async function handleOk() {
  await Promise.resolve()
  closeModal()
}
</script>

<template>
  <n-button @click="openModal()">
    打开
  </n-button>
  <BasicModal title="示例弹窗" @register="registerModal" @ok="handleOk">
    弹窗内容
  </BasicModal>
</template>
```

## Props

组件继承 `NModal` 与 `NCard` 的大部分属性，以下为主要封装属性。

| Prop               | 类型                                | 默认值          | 说明                                           |
| ------------------ | ----------------------------------- | --------------- | ---------------------------------------------- |
| `title`            | `string`                            | Naive UI 默认值 | 标题；未设置时显示“弹窗”                       |
| `width`            | `string \| number`                  | `'800px'`       | 卡片宽度，数字按 px 处理                       |
| `height`           | `string \| number`                  | `'420px'`       | 内容滚动区域高度，数字按 px 处理               |
| `draggable`        | `boolean`                           | `true`          | 透传弹窗拖拽相关配置                           |
| `loading`          | `boolean`                           | `false`         | 内容区域加载遮罩                               |
| `confirmLoading`   | `boolean`                           | `false`         | 确认按钮加载状态                               |
| `showOkButton`     | `boolean`                           | `true`          | 是否显示确认按钮                               |
| `showCancelButton` | `boolean`                           | `true`          | 是否显示取消按钮                               |
| `okType`           | `ButtonType`                        | `'primary'`     | 确认按钮类型                                   |
| `okText`           | `string`                            | `'确认'`        | 确认按钮文字                                   |
| `cancelText`       | `string`                            | `'取消'`        | 取消按钮文字                                   |
| `closeFunc`        | `() => boolean \| Promise<boolean>` | `null`          | 关闭前回调；返回 truthy 才关闭                 |
| `showFooter`       | `boolean`                           | `true`          | 兼容属性；当前默认操作区由两个按钮显示属性控制 |

## Events

| Event      | 参数            | 说明                                          |
| ---------- | --------------- | --------------------------------------------- |
| `register` | `instance, uid` | 注册弹窗实例；通常绑定组合式函数的 `register` |
| `ok`       | 无              | 点击默认确认按钮；不会自动关闭                |
| `close`    | 无              | 无 `closeFunc` 时执行关闭流程触发             |

## Slots

| Slot      | 说明                                |
| --------- | ----------------------------------- |
| `default` | 弹窗滚动内容                        |
| `footer`  | `NCard` footer 区域，不替代操作按钮 |
| `action`  | 插入默认取消/确认按钮之前的操作内容 |

## useModal

父组件控制独立弹窗组件时使用：

```vue
<script setup lang="ts">
import { useModal } from '@/components/Modal'
import UserModal from './UserModal.vue'

const [registerModal, { openModal }] = useModal()

function handleEdit(record: Record<string, unknown>) {
  openModal({ isUpdate: true, record })
}
</script>

<template>
  <UserModal @register="registerModal" />
</template>
```

| 方法            | 签名                           | 说明                                  |
| --------------- | ------------------------------ | ------------------------------------- |
| `openModal`     | `(data?, show = true) => void` | 打开弹窗并向 `useModalInner` 传递数据 |
| `closeModal`    | `() => void`                   | 关闭弹窗                              |
| `setModalProps` | `(props) => void`              | 动态合并弹窗属性                      |

## useModalInner

独立弹窗组件内部用于接收父组件数据：

```vue
<script setup lang="ts">
import { BasicModal, useModalInner } from '@/components/Modal'

defineEmits<{
  register: [instance: unknown, uid: number]
}>()

const [registerModal, { closeModal, setModalProps }] = useModalInner((data) => {
  console.log(data)
})

async function handleOk() {
  setModalProps({ loading: true })
  try {
    await Promise.resolve()
    closeModal()
  }
  finally {
    setModalProps({ loading: false })
  }
}
</script>

<template>
  <BasicModal title="编辑" @register="registerModal" @ok="handleOk">
    内容
  </BasicModal>
</template>
```

`useModalInner` 返回 `openModal()`、`closeModal()` 和 `setModalProps()`。

## 默认行为和关键交互

- `openModal(data)` 先显示弹窗，再在下一次更新时把数据交给内部回调。
- 点击确认只触发 `ok`，保存成功后必须由业务代码调用 `closeModal()`。
- 点击关闭、遮罩关闭或取消时执行关闭流程。
- 配置 `closeFunc` 后，返回 truthy 才关闭；返回 false 会保持打开。
- `loading` 控制内容遮罩，`confirmLoading` 只控制确认按钮。

## 注意事项及不推荐用法

- 独立业务弹窗优先使用 `useModal` + `useModalInner`，不要在父组件中持有组件内部 ref 并调用私有状态。
- 不要假设 `ok` 会自动关闭，异步保存失败时应保留弹窗。
- 要隐藏默认操作按钮，请同时设置 `showOkButton=false`、`showCancelButton=false`，或通过 `action` 扩展操作。
- `closeFunc` 应只负责确认能否关闭，不应在其中直接修改弹窗内部显示状态。
