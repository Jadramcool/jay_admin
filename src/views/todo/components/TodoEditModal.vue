<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TodoApi } from '@/api/todo'

interface OpenOptions {
  mode: 'create' | 'edit'
  todo?: System.Todo
  pid?: number
  parentTitle?: string
}

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const pid = ref<number | null>(null)
const parentTitle = ref('')
const submitting = ref(false)

const formData = reactive({
  id: 0,
  title: '',
  content: '',
})

function open(options: OpenOptions) {
  mode.value = options.mode
  pid.value = options.pid ?? null
  parentTitle.value = options.parentTitle ?? ''
  formData.id = options.todo?.id ?? 0
  formData.title = options.todo?.title ?? ''
  formData.content = options.todo?.content ?? ''
  visible.value = true
}

async function handleSubmit() {
  const title = formData.title.trim()
  if (!title) {
    window.$message?.warning?.('请输入待办标题')
    return
  }
  submitting.value = true
  try {
    const content = formData.content.trim() || undefined
    if (mode.value === 'edit') {
      await TodoApi.update({ id: formData.id, title, content })
      window.$message?.success?.('已保存')
    }
    else {
      await TodoApi.create({
        title,
        content,
        pid: pid.value ?? undefined,
      })
      window.$message?.success?.('已添加')
    }
    visible.value = false
    emit('success')
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="mode === 'edit' ? '编辑待办' : '新建待办'"
    style="width: 480px"
    :mask-closable="false"
  >
    <div class="flex flex-col gap-3">
      <div v-if="mode === 'create' && parentTitle" class="text-xs" style="color: var(--card-sub-text)">
        将添加为「{{ parentTitle }}」的子任务
      </div>
      <n-input
        v-model:value="formData.title"
        placeholder="待办标题（必填，最多 200 字）"
        maxlength="200"
        @keyup.enter="handleSubmit"
      />
      <n-input
        v-model:value="formData.content"
        type="textarea"
        placeholder="补充内容（选填，最多 1000 字）"
        maxlength="1000"
        :autosize="{ minRows: 3, maxRows: 6 }"
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="visible = false">
          取消
        </n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
