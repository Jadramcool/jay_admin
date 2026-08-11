<script setup lang="ts">
import { NButton, NInput, NSelect, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { TodoApi } from '@/api/todo'
import TodoItem from './components/TodoItem.vue'

const items = ref<System.Todo[]>([])
const stats = ref({ total: 0, undone: 0, done: 0 })
const loading = ref(false)

const title = ref('')
const parentId = ref<number | null>(null)
const creating = ref(false)

async function load() {
  loading.value = true
  try {
    const [list, stat] = await Promise.all([TodoApi.list(), TodoApi.stats()])
    items.value = list
    stats.value = stat
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    loading.value = false
  }
}

/** 父级选项:仅顶层待办(pid 为 null)可作父级 */
const parentOptions = computed(() =>
  items.value.filter(i => i.pid == null).map(i => ({ label: i.title, value: i.id })),
)

async function handleAdd() {
  const t = title.value.trim()
  if (!t) {
    window.$message?.warning?.('请输入待办标题')
    return
  }
  creating.value = true
  try {
    await TodoApi.create({ title: t, pid: parentId.value ?? undefined })
    window.$message?.success?.('已添加')
    title.value = ''
    parentId.value = null
    load()
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    creating.value = false
  }
}

async function handleToggle(id: number) {
  try {
    const todo = await TodoApi.toggle(id)
    window.$message?.success?.(todo.isDone ? '已完成' : '已恢复')
    load()
  }
  catch {
    /* handled by interceptor */
  }
}

async function handleDelete(id: number) {
  window.$dialog?.warning({
    title: '提示',
    content: '确定要删除该待办及其子任务吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await TodoApi.delete(id)
        window.$message?.success?.('删除成功')
        load()
      }
      catch {
        /* handled by interceptor */
      }
    },
  })
}

onMounted(load)
</script>

<template>
  <div class="system-page">
    <div class="todo-stats mb-3 flex gap-3">
      <n-card size="small" class="flex-1">
        <div class="text-sm" style="color: var(--card-sub-text)">
          待办总数
        </div>
        <div class="text-xl font-bold">
          {{ stats.total }}
        </div>
      </n-card>
      <n-card size="small" class="flex-1">
        <div class="text-sm" style="color: var(--card-sub-text)">
          未完成
        </div>
        <div class="text-xl font-bold" style="color: var(--error-color, #d03050)">
          {{ stats.undone }}
        </div>
      </n-card>
      <n-card size="small" class="flex-1">
        <div class="text-sm" style="color: var(--card-sub-text)">
          已完成
        </div>
        <div class="text-xl font-bold" style="color: var(--success-color, #18a058)">
          {{ stats.done }}
        </div>
      </n-card>
    </div>

    <n-card size="small" title="我的待办">
      <template #header-extra>
        <NTag :bordered="false" size="small" type="info">
          子任务勾选父级后添加
        </NTag>
      </template>

      <div class="mb-4 flex gap-2">
        <NInput v-model:value="title" placeholder="输入待办内容，回车添加" maxlength="200" clearable @keyup.enter="handleAdd" />
        <NSelect
          v-model:value="parentId"
          :options="parentOptions"
          placeholder="父级(可选)"
          clearable
          style="width: 200px"
        />
        <NButton type="primary" :loading="creating" @click="handleAdd">
          添加
        </NButton>
      </div>

      <n-spin :show="loading">
        <TodoItem :items="items" @toggle="handleToggle" @delete="handleDelete" />
      </n-spin>
    </n-card>
  </div>
</template>
