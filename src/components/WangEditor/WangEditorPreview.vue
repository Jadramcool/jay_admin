<template>
  <div
    ref="editorRef"
    class="wang-editor-preview"
    :style="{ height: height + 'px' }" />
</template>

<script setup lang="ts">
import type { IDomEditor, IEditorConfig } from "@wangeditor/editor";
import { createEditor, i18nChangeLanguage } from "@wangeditor/editor";

defineOptions({ name: "WangEditorPreview" });

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    height?: number;
  }>(),
  {
    modelValue: "",
    height: 400,
  },
);

i18nChangeLanguage("zh-CN");

const editorRef = ref<HTMLDivElement | null>(null);
let editor: IDomEditor | null = null;

const editorConfig: Partial<IEditorConfig> = {
  readOnly: true,
};

onMounted(() => {
  if (!editorRef.value) return;
  editor = createEditor({
    selector: editorRef.value,
    config: editorConfig,
    content: [],
    mode: "default",
  });
  if (props.modelValue) {
    editor.setHtml(props.modelValue);
  }
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor && val) {
      if (val !== editor.getHtml()) {
        editor.setHtml(val || "");
      }
    }
  },
);

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});
</script>

<style lang="scss" scoped>
.wang-editor-preview {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-height: 100px;
  overflow-y: auto;
  background: var(--input-color);

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    border: 1px solid #d9d9d9;
    padding: 6px 12px;
    text-align: left;
  }

  th {
    background: #f5f7fa;
    font-weight: 600;
  }
}
</style>

