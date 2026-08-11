<script setup lang="ts">
import { arrayToTree } from '@/utils/common/arrayToTree'

const props = defineProps<{
  items: System.Todo[]
}>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()

const tree = computed(() => arrayToTree(props.items))
</script>

<template>
  <ul v-if="tree.length" class="todo-tree">
    <li v-for="item in tree" :key="item.id" class="todo-tree__item">
      <div class="todo-tree__row" :class="{ 'todo-tree__row--done': item.isDone }">
        <n-checkbox :checked="item.isDone" @update:checked="emit('toggle', item.id)" />
        <span class="todo-tree__title">{{ item.title }}</span>
        <div class="todo-tree__actions">
          <n-button size="tiny" quaternary type="error" @click="emit('delete', item.id)">
            删除
          </n-button>
        </div>
      </div>
      <TodoItem v-if="item.children?.length" :items="item.children" @toggle="emit('toggle', $event)" @delete="emit('delete', $event)" />
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
  align-items: center;
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

.todo-tree__title {
  flex: 1;
  font-size: 14px;
}

.todo-tree__actions {
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
