# Drawer 抽屉组件

## 组件用途与适用场景

`BasicDrawer` 用于侧边设置、详情或轻量编辑场景，统一封装标题、方向、宽度、底部操作和命令式开关。配套 `useDrawer` 适合同一组件内控制抽屉，`useDrawerInner` 适合在抽屉内部接收打开数据。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import { BasicDrawer, useDrawer } from '@/components/Drawer'

const [registerDrawer, { openDrawer, closeDrawer }] = useDrawer()

async function handleOk() {
  await Promise.resolve()
  closeDrawer()
}
</script>

<template>
  <n-button @click="openDrawer()">
    打开设置
  </n-button>
  <BasicDrawer
    title="系统设置"
    show-footer
    @register="registerDrawer"
    @ok="handleOk"
  >
    抽屉内容
  </BasicDrawer>
</template>
```

## Props

除下列属性外，其余属性透传给 `NDrawer`。

| Prop            | 类型                                     | 默认值    | 说明                   |
| --------------- | ---------------------------------------- | --------- | ---------------------- |
| `title`         | `string`                                 | `''`      | 抽屉标题               |
| `width`         | `number \| string`                       | `500`     | 抽屉宽度               |
| `placement`     | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 出现方向               |
| `showFooter`    | `boolean`                                | `false`   | 是否显示默认底部操作区 |
| `submitLoading` | `boolean`                                | `false`   | 默认确认按钮加载状态   |

## Events

| Event      | 参数           | 说明                           |
| ---------- | -------------- | ------------------------------ |
| `register` | `drawerAction` | 挂载后注册公开方法             |
| `ok`       | 无             | 点击默认确认按钮；不会自动关闭 |
| `close`    | 无             | 抽屉离场动画结束后触发         |

## Slots

| Slot      | 说明                                                           |
| --------- | -------------------------------------------------------------- |
| `default` | 抽屉主体内容                                                   |
| `footer`  | 自定义底部；未提供且 `showFooter=true` 时显示默认取消/确认按钮 |

## 暴露方法与组合式函数

`BasicDrawer` 暴露：

| 方法            | 说明     |
| --------------- | -------- |
| `openDrawer()`  | 打开抽屉 |
| `closeDrawer()` | 关闭抽屉 |

`useDrawer` 返回 `[register, methods]`：

| 方法               | 说明                           |
| ------------------ | ------------------------------ |
| `openDrawer()`     | 调用已注册实例打开抽屉         |
| `closeDrawer()`    | 调用已注册实例关闭抽屉         |
| `setDrawerProps()` | 预留兼容方法，当前没有实际行为 |

`useDrawerInner(callback)` 适用于同一抽屉组件内部，通过 `openDrawer(data)` 在打开后把数据传入 callback，并同时提供 `closeDrawer()`。

## 默认行为和关键交互

- 遮罩可点击关闭，内容区自带关闭按钮和非原生滚动条。
- 默认确认按钮只触发 `ok`，保存完成后由业务代码关闭。
- `close` 在离场动画完成后触发，不是点击关闭瞬间触发。
- `footer` 插槽优先于默认按钮组。

## 注意事项及不推荐用法

- 当前 `useDrawer.openDrawer(data)` 的 data 不会自动传给外部组件；需要数据回调时使用 `useDrawerInner` 或显式 props。
- 当前 `setDrawerProps` 为预留 API，请勿依赖它动态更新属性。
- 不要直接修改抽屉内部 `showDrawer`，统一使用公开方法。
