<script setup lang="ts">
import { arrayToTree } from '@/utils/common/arrayToTree'

const props = defineProps<{
  items: System.Todo[]
}>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
  edit: [item: System.Todo]
  addChild: [item: System.Todo]
}>()

const tree = computed(() => arrayToTree(props.items))

function formatTime(value?: string | null) {
  if (!value)
    return ''
  return value.slice(0, 16).replace('T', ' ')
}
</script>

<template>
  <ul v-if="tree.length" class="todo-tree">
    <li v-for="item in tree" :key="item.id" class="todo-tree__item">
      <div class="todo-tree__row" :class="{ 'todo-tree__row--done': item.isDone }">
        <n-checkbox :checked="item.isDone" @update:checked="emit('toggle', item.id)" />
        <div class="todo-tree__body">
          <span class="todo-tree__title">{{ item.title }}</span>
          <span v-if="item.content" class="todo-tree__content">{{ item.content }}</span>
          <span v-if="item.isDone && item.doneTime" class="todo-tree__meta">
            完成于 {{ formatTime(item.doneTime) }}
          </span>
          <span v-else class="todo-tree__meta">
            创建于 {{ formatTime(item.createdTime) }}
          </span>
        </div>
        <div class="todo-tree__actions">
          <n-button size="tiny" quaternary type="primary" @click="emit('addChild', item)">
            子任务
          </n-button>
          <n-button size="tiny" quaternary @click="emit('edit', item)">
            编辑
          </n-button>
          <n-button size="tiny" quaternary type="error" @click="emit('remove', item.id)">
            删除
          </n-button>
        </div>
      </div>
      <TodoItem
        v-if="item.children?.length"
        :items="item.children"
        @toggle="emit('toggle', $event)"
        @remove="emit('remove', $event)"
        @edit="emit('edit', $event)"
        @add-child="emit('addChild', $event)"
      />
    </li>
  </ul>
  <n-empty v-else description="暂无待办" style="padding: 24px 0" />
</template>

<style scoped>
.todo-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.todo-tree__item {
  padding: 2px 0;
}

.todo-tree__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.todo-tree__row:hover {
  background-color: var(--hover-color, rgba(128, 128, 128, 0.08));
}

.todo-tree__row--done .todo-tree__title {
  text-decoration: line-through;
  opacity: 0.55;
}

.todo-tree__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.todo-tree__title {
  font-size: 14px;
}

.todo-tree__content {
  font-size: 12px;
  color: var(--card-sub-text, #909090);
  white-space: pre-wrap;
  word-break: break-all;
}

.todo-tree__meta {
  font-size: 12px;
  color: var(--card-sub-text, #909090);
}

.todo-tree__actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-tree__row:hover .todo-tree__actions {
  opacity: 1;
}

.todo-tree .todo-tree {
  margin-left: 28px;
}
</style>
