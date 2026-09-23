<script setup lang="ts">
import { NButton, NInput, NTag } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { TodoApi } from '@/api/todo'
import TodoEditModal from './components/TodoEditModal.vue'
import TodoItem from './components/TodoItem.vue'

type FilterKey = 'all' | 'undone' | 'done'

const items = ref<System.Todo[]>([])
const stats = ref({ total: 0, undone: 0, done: 0 })
const loading = ref(false)

const filter = ref<FilterKey>('all')
const keyword = ref('')
const keywordInput = ref('')

const editModalRef = ref<InstanceType<typeof TodoEditModal> | null>(null)

const filterOptions: { key: FilterKey, label: string, count: number }[] = computed(() => [
  { key: 'all', label: '全部', count: stats.value.total },
  { key: 'undone', label: '未完成', count: stats.value.undone },
  { key: 'done', label: '已完成', count: stats.value.done },
] as any).value

async function load() {
  loading.value = true
  try {
    const [list, stat] = await Promise.all([
      TodoApi.list({
        isDone: filter.value === 'undone' ? 0 : filter.value === 'done' ? 1 : undefined,
        keyword: keyword.value || undefined,
      }),
      TodoApi.stats(),
    ])
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

function setFilter(key: FilterKey) {
  filter.value = key
  load()
}

function handleSearch() {
  keyword.value = keywordInput.value.trim()
  load()
}

function handleClearSearch() {
  keywordInput.value = ''
  keyword.value = ''
  load()
}

function handleOpenCreate() {
  editModalRef.value?.open({ mode: 'create' })
}

function handleEdit(item: System.Todo) {
  editModalRef.value?.open({ mode: 'edit', todo: item })
}

function handleAddChild(item: System.Todo) {
  editModalRef.value?.open({ mode: 'create', pid: item.id, parentTitle: item.title })
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

function handleDelete(id: number) {
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
      <n-card
        v-for="opt in filterOptions"
        :key="opt.key"
        size="small"
        class="flex-1 cursor-pointer"
        :class="{ 'todo-stats__active': filter === opt.key }"
        @click="setFilter(opt.key)"
      >
        <div class="text-sm" style="color: var(--card-sub-text)">
          {{ opt.label }}
        </div>
        <div
          class="text-xl font-bold"
          :style="opt.key === 'undone' ? 'color: var(--error-color, #d03050)' : opt.key === 'done' ? 'color: var(--success-color, #18a058)' : ''"
        >
          {{ opt.count }}
        </div>
      </n-card>
    </div>

    <n-card size="small" title="我的待办">
      <template #header-extra>
        <NTag :bordered="false" size="small" type="info">
          子任务可在条目上直接添加
        </NTag>
      </template>

      <div class="mb-4 flex flex-col gap-2">
        <div class="flex gap-2">
          <NInput
            v-model:value="keywordInput"
            placeholder="搜索待办标题，回车确认"
            maxlength="200"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClearSearch"
          />
          <NButton @click="handleSearch">
            搜索
          </NButton>
          <NButton type="primary" @click="handleOpenCreate">
            新建待办
          </NButton>
        </div>
        <div v-if="keyword" class="text-xs" style="color: var(--card-sub-text)">
          正在筛选关键字「{{ keyword }}」，
          <a class="cursor-pointer" @click="handleClearSearch">清除</a>
        </div>
      </div>

      <n-spin :show="loading">
        <TodoItem
          :items="items"
          @toggle="handleToggle"
          @remove="handleDelete"
          @edit="handleEdit"
          @add-child="handleAddChild"
        />
      </n-spin>
    </n-card>

    <TodoEditModal ref="editModalRef" @success="load" />
  </div>
</template>

<style scoped>
.todo-stats__active {
  outline: 2px solid var(--primary-color, #2080f0);
  outline-offset: -2px;
}
</style>
