<template>
  <div class="wang-editor-wrapper">
    <div ref="toolbarRef" class="editor-toolbar" />
    <div ref="editorRef" class="editor-content" :style="{ height: height + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { i18nChangeLanguage, createEditor, createToolbar, Boot } from '@wangeditor/editor'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// 设置中文
i18nChangeLanguage('zh-CN')

// 设置中文
i18nChangeLanguage('zh-CN')

defineOptions({ name: 'WangEditor' })

const props = withDefaults(defineProps<{
  modelValue?: string
  height?: number
}>(), {
  modelValue: '',
  height: 350,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toolbarRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
let editor: IDomEditor | null = null
let isInternalChange = false

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'group-video',
    'group-image',
    'insertTable',
    'group-indent',
    'group-line-height',
  ],
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入公告内容...',
  MENU_CONF: {},
  onChange: () => {
    if (editor && !isInternalChange) {
      const html = editor.getHtml()
      isInternalChange = false
      emit('update:modelValue', html)
    }
  },
}

onMounted(() => {
  if (!toolbarRef.value || !editorRef.value) return

  // 创建编辑器
  editor = createEditor({
    selector: editorRef.value,
    config: editorConfig,
    content: props.modelValue || [],
    mode: 'default',
  })

  // 创建工具栏
  createToolbar({
    editor,
    selector: toolbarRef.value,
    config: toolbarConfig,
    mode: 'default',
  })

  // 如果已有内容，设置 HTML
  if (props.modelValue) {
    editor.setHtml(props.modelValue)
  }
})

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  if (editor && val !== editor.getHtml()) {
    isInternalChange = true
    editor.setHtml(val || '')
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>

<style scoped>
.wang-editor-wrapper {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}
.editor-toolbar {
  border-bottom: 1px solid #d9d9d9;
}
.editor-content {
  overflow-y: auto;
}
</style>
