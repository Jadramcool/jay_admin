# WangEditor 富文本组件

## 用途与适用场景

`WangEditor` 用于编辑业务富文本，`WangEditorPreview` 用于只读展示富文本。两者在把 HTML 写入编辑器 DOM 前都会使用 DOMPurify 清洗内容，适用于公告等需要保留基础富文本格式的场景。

前端清洗是纵深防御，不能替代服务端保存前的白名单清洗。

## 引入方式和最小示例

```vue
<script setup lang="ts">
import WangEditor from '@/components/WangEditor/index.vue'

const content = ref('')
</script>

<template>
  <WangEditor v-model="content" />
</template>
```

## Props

### WangEditor

| 属性         | 类型     | 默认值 | 必填 | 说明                            |
| ------------ | -------- | ------ | ---- | ------------------------------- |
| `modelValue` | `string` | `''`   | 否   | 富文本 HTML；写入编辑器前会清洗 |
| `height`     | `number` | `350`  | 否   | 编辑区域高度，单位为 px         |

### WangEditorPreview

| 属性         | 类型     | 默认值 | 必填 | 说明                                       |
| ------------ | -------- | ------ | ---- | ------------------------------------------ |
| `modelValue` | `string` | `''`   | 否   | 待展示的富文本 HTML；写入预览 DOM 前会清洗 |
| `height`     | `number` | `400`  | 否   | 预览区域高度，单位为 px                    |

## Events

### WangEditor

| 事件                | 参数            | 说明                                    |
| ------------------- | --------------- | --------------------------------------- |
| `update:modelValue` | `value: string` | 编辑内容变化后触发，返回经过清洗的 HTML |

`WangEditorPreview` 不触发业务事件。

## Slots

两个组件均不提供公开插槽。

## 暴露方法与组合式函数

两个组件均未通过 `defineExpose` 暴露方法，也没有配套组合式函数。业务侧应通过 `v-model` 或 Props 传递内容，不应访问内部编辑器实例。

## 默认行为和关键交互语义

- `WangEditor` 使用 150 ms 防抖同步编辑结果。
- 外部更新 `modelValue` 时，内容会在清洗后写回编辑器。
- `WangEditorPreview` 为只读模式，不允许修改内容。
- DOMPurify 会移除脚本、事件属性和其他不安全标记；清洗后的结果可能与原始 HTML 不完全一致。
- 图片、视频和表格插入工具默认不在编辑器工具栏开放。

## 完整业务示例

```vue
<script setup lang="ts">
import { NoticeApi } from '@/api/notice'
import WangEditor from '@/components/WangEditor/index.vue'
import WangEditorPreview from '@/components/WangEditor/WangEditorPreview.vue'

const content = ref('<p>公告内容</p>')
const previewVisible = ref(false)

async function saveNotice() {
  await NoticeApi.create({
    title: '系统公告',
    content: content.value,
  })
}
</script>

<template>
  <WangEditor v-model="content" :height="420" />

  <n-button @click="previewVisible = true">
    预览
  </n-button>
  <n-button type="primary" @click="saveNotice">
    保存
  </n-button>

  <WangEditorPreview
    v-if="previewVisible"
    :model-value="content"
    :height="500"
  />
</template>
```

## 注意事项和不推荐用法

- 服务端必须再次清洗并校验富文本，不能信任前端提交结果。
- 不要通过 DOM 查询或组件 ref 获取内部 wangEditor 实例。
- 不要绕过组件直接使用 `innerHTML` 展示公告内容。
- 不要把未经清洗的 HTML 用于 iframe、邮件模板或其他具有不同安全边界的渲染环境。
