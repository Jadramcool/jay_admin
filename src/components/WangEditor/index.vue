<template>
  <div class="wang-editor-wrapper">
    <div ref="toolbarRef" class="editor-toolbar" />
    <div ref="editorRef" class="editor-content" :style="{ height: height + 'px' }" />
  </div>
</template>

<script setup lang="ts">
import { i18nChangeLanguage, createEditor, createToolbar } from '@wangeditor/editor'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { debounce } from 'lodash-es'

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

i18nChangeLanguage('zh-CN')

const toolbarRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
let editor: IDomEditor | null = null

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
  onChange: debounce(() => {
    if (editor) {
      emit('update:modelValue', editor.getHtml())
    }
  }, 150),
}

onMounted(() => {
  if (!toolbarRef.value || !editorRef.value) return

  editor = createEditor({
    selector: editorRef.value,
    config: editorConfig,
    content: [],
    mode: 'default',
  })

  createToolbar({
    editor,
    selector: toolbarRef.value,
    config: toolbarConfig,
    mode: 'default',
  })

  if (props.modelValue) {
    editor.setHtml(props.modelValue)
  }
})

watch(() => props.modelValue, (val) => {
  if (editor && val != null && val !== editor.getHtml()) {
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

<style lang="scss" scoped>
.wang-editor-wrapper {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    border-bottom: 1px solid #d9d9d9;
  }

  .editor-content {
    overflow-y: auto;
  }
}
</style>
