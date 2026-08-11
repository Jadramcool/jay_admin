# Common 通用组件

## 组件用途与适用场景

本目录提供无业务领域依赖的轻量 UI 组件。

- `JIcon`：统一 Iconify 图标、尺寸、主题色与旋转状态。
- `JIconButton`：带无障碍名称和悬停提示的图标按钮。
- `AppCard`：统一卡片边框、阴影、加载、空状态和折叠行为；通过组件自动导入使用。

`AppPage`、`GlobalLoading` 属于应用布局内部组件，当前不作为稳定公共 API。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import { JIcon, JIconButton } from '@/components'
</script>

<template>
  <JIcon icon="icon-park-outline:home" />
  <JIconButton icon="icon-park-outline:refresh" label="刷新" />
</template>
```

`AppCard` 已由自动组件插件注册，可直接在模板使用：

```vue
<template>
  <AppCard title="数据概览" loading>
    内容
  </AppCard>
</template>
```

## JIcon

### Props

| Prop    | 类型                                                       | 默认值      | 必填 | 说明                                  |
| ------- | ---------------------------------------------------------- | ----------- | ---- | ------------------------------------- |
| `icon`  | `string`                                                   | `undefined` | 否   | Iconify 图标名称；为空时不渲染        |
| `color` | `string`                                                   | `undefined` | 否   | 自定义颜色                            |
| `size`  | `number`                                                   | `18`        | 否   | 图标大小                              |
| `depth` | `1 \| 2 \| 3 \| 4 \| 5`                                    | `undefined` | 否   | Naive UI 图标深度                     |
| `hover` | `boolean`                                                  | `false`     | 否   | 是否显示手型指针                      |
| `type`  | `'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `undefined` | 否   | 主题类型；当前仅 `primary` 映射主题色 |
| `spin`  | `boolean`                                                  | `false`     | 否   | 是否持续旋转                          |

### Events、Slots 和暴露方法

`JIcon` 没有自定义 Events、Slots 或暴露方法。点击行为应绑定在语义化按钮上，不要直接把图标当按钮。

## JIconButton

### Props

| Prop       | 类型      | 默认值  | 必填 | 说明                              |
| ---------- | --------- | ------- | ---- | --------------------------------- |
| `icon`     | `string`  | 无      | 是   | Iconify 图标名称                  |
| `label`    | `string`  | 无      | 是   | 无障碍名称，同时作为 `title` 提示 |
| `size`     | `number`  | `18`    | 否   | 图标大小                          |
| `disabled` | `boolean` | `false` | 否   | 是否禁用                          |

### Events

组件使用原生 `<button type="button">`，支持直接绑定原生 `click`、`focus`、`keydown` 等事件。

### Slots

| Slot      | 说明                                           |
| --------- | ---------------------------------------------- |
| `default` | 图标后的文字或附加内容；存在时按钮宽度自动扩展 |

```vue
<script setup lang="ts">
async function handleDelete() {
  await Promise.resolve()
}
</script>

<template>
  <JIconButton icon="icon-park-outline:delete" label="删除" @click="handleDelete">
    删除
  </JIconButton>
</template>
```

## AppCard

### Props

| Prop           | 类型                                       | 默认值             | 说明                         |
| -------------- | ------------------------------------------ | ------------------ | ---------------------------- |
| `title`        | `string`                                   | `undefined`        | 卡片标题                     |
| `size`         | `'small' \| 'medium' \| 'large' \| 'huge'` | `'small'`          | 卡片尺寸                     |
| `hoverable`    | `boolean`                                  | `false`            | 是否显示悬停效果             |
| `segmented`    | `boolean \| object`                        | `undefined`        | Naive UI 分段配置            |
| `contentStyle` | `string \| CSSProperties`                  | `'padding: 16px;'` | 内容样式                     |
| `headerStyle`  | `string \| CSSProperties`                  | `undefined`        | 头部样式                     |
| `footerStyle`  | `string \| CSSProperties`                  | `undefined`        | 底部样式                     |
| `closable`     | `boolean`                                  | `false`            | 是否显示 Naive UI 关闭按钮   |
| `shadow`       | `'none' \| 'light' \| 'medium' \| 'heavy'` | `'light'`          | 阴影等级                     |
| `loading`      | `boolean`                                  | `false`            | 是否显示骨架屏               |
| `loadingRows`  | `number`                                   | `3`                | 骨架屏行组数量               |
| `emptyText`    | `string`                                   | `undefined`        | 默认插槽无内容时显示的空文案 |
| `collapsible`  | `boolean`                                  | `false`            | 是否允许折叠内容             |

### Slots

`AppCard` 支持 `default`、`header`、`header-extra`、`footer`、`action`、`cover`。启用 `collapsible` 时，折叠按钮占用 `header-extra` 起始位置，自定义 `header-extra` 会追加显示。

### 默认行为和关键交互

- `loading=true` 时只显示骨架屏。
- `collapsible=true` 时仅隐藏内容区，头部仍保留。
- 默认插槽无有效内容且设置 `emptyText` 时显示空文案。

## 注意事项及不推荐用法

- 可点击图标必须使用 `JIconButton` 或其他语义化按钮，不要只在 `JIcon` 上绑定点击。
- `JIconButton.label` 必须描述动作，不要使用“按钮”“图标”等无意义文字。
- `AppCard` 只负责通用容器状态，业务请求和数据状态仍由页面或 feature 组件管理。
