<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { TodoApi } from '@/api/todo'

const props = defineProps<{
  mine: Dashboard.MineInfo | null
  loading: boolean
  reload: () => void
}>()

const router = useRouter()

const newTitle = ref('')
const creating = ref(false)
const togglingId = ref<number | null>(null)

/** 进行中列表按创建日分组,聚焦"今天要做的事" */
const todayItems = computed(() =>
  (props.mine?.todo.recent ?? []).filter(t => dayjs(t.createdTime).isSame(dayjs(), 'day')),
)
const earlierItems = computed(() =>
  (props.mine?.todo.recent ?? []).filter(t => !dayjs(t.createdTime).isSame(dayjs(), 'day')),
)

/** 已完成(懒加载:首次展开才请求) */
const showDone = ref(false)
const doneLoading = ref(false)
const doneItems = ref<System.Todo[]>([])
const doneLoaded = ref(false)

async function ensureDoneLoaded() {
  if (doneLoaded.value || doneLoading.value)
    return
  doneLoading.value = true
  try {
    const all = await TodoApi.list()
    doneItems.value = all.filter(t => t.isDone).slice(0, 5)
    doneLoaded.value = true
  }
  catch {
    doneItems.value = []
  }
  finally {
    doneLoading.value = false
  }
}

function toggleDone() {
  showDone.value = !showDone.value
  if (showDone.value)
    ensureDoneLoaded()
}

function formatTime(time: string): string {
  const d = dayjs(time)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return `今天 ${d.format('HH:mm')}`
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return `昨天 ${d.format('HH:mm')}`
  return d.format('MM/DD')
}

async function addTodo() {
  const title = newTitle.value.trim()
  if (!title || creating.value)
    return
  creating.value = true
  try {
    await TodoApi.create({ title })
    newTitle.value = ''
    props.reload()
  }
  finally {
    creating.value = false
  }
}

async function toggle(id: number) {
  if (togglingId.value !== null)
    return
  togglingId.value = id
  try {
    await TodoApi.toggle(id)
    if (showDone.value)
      await ensureDoneLoaded()
    props.reload()
  }
  finally {
    togglingId.value = null
  }
}
</script>

<template>
  <AppCard title="待办事项">
    <template #header-extra>
      <button class="wb-todo__more" @click="router.push('/todo')">
        全部待办
      </button>
    </template>

    <n-skeleton v-if="loading" :repeat="5" text />

    <template v-else>
      <!-- 快捷添加:回车或按钮即可创建 -->
      <div class="wb-todo__composer">
        <n-input
          v-model:value="newTitle"
          size="small"
          placeholder="添加待办，回车创建…"
          :disabled="creating"
          @keydown.enter="addTodo"
        />
        <n-button size="small" type="primary" secondary :loading="creating" :disabled="!newTitle.trim()" @click="addTodo">
          添加
        </n-button>
      </div>

      <div v-if="(mine?.todo.recent.length ?? 0) === 0" class="wb-todo__empty">
        太棒了，待办都清空啦
      </div>

      <div v-else class="wb-todo__list">
        <template v-if="todayItems.length">
          <div class="wb-todo__group">
            今天
          </div>
          <div v-for="todo in todayItems" :key="todo.id" class="wb-todo__item">
            <n-checkbox
              :checked="todo.isDone"
              :disabled="togglingId !== null"
              @update:checked="toggle(todo.id)"
            />
            <span class="wb-todo__title" :title="todo.title">{{ todo.title }}</span>
            <span class="wb-todo__time">{{ formatTime(todo.createdTime) }}</span>
          </div>
        </template>
        <template v-if="earlierItems.length">
          <div class="wb-todo__group">
            更早
          </div>
          <div v-for="todo in earlierItems" :key="todo.id" class="wb-todo__item">
            <n-checkbox
              :checked="todo.isDone"
              :disabled="togglingId !== null"
              @update:checked="toggle(todo.id)"
            />
            <span class="wb-todo__title" :title="todo.title">{{ todo.title }}</span>
            <span class="wb-todo__time">{{ formatTime(todo.createdTime) }}</span>
          </div>
        </template>
      </div>

      <!-- 已完成折叠,懒加载最近 5 条 -->
      <button v-if="(mine?.todo.doneCount ?? 0) > 0" class="wb-todo__done-toggle" @click="toggleDone">
        <span>{{ showDone ? '收起' : '展开' }}已完成 ({{ mine?.todo.doneCount }})</span>
      </button>
      <div v-if="showDone" class="wb-todo__done">
        <n-skeleton v-if="doneLoading" :repeat="2" text />
        <div v-for="todo in doneItems" :key="todo.id" class="wb-todo__item wb-todo__item--done">
          <n-checkbox
            :checked="todo.isDone"
            :disabled="togglingId !== null"
            @update:checked="toggle(todo.id)"
          />
          <span class="wb-todo__title wb-todo__title--done" :title="todo.title">{{ todo.title }}</span>
          <span class="wb-todo__time">{{ formatTime(todo.createdTime) }}</span>
        </div>
      </div>
    </template>
  </AppCard>
</template>

<style lang="scss" scoped>
.wb-todo__more {
  border: none;
  background: transparent;
  color: var(--text-color-4);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;
  &:hover {
    background: var(--hover-color);
    color: var(--text-color-1);
  }
}

.wb-todo__composer {
  display: flex;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--divider-color);
}

.wb-todo__group {
  font-size: 11.5px;
  color: var(--text-color-4);
  padding: 6px 10px 4px;
  letter-spacing: 0.02em;
}

.wb-todo__list {
  display: flex;
  flex-direction: column;
}

.wb-todo__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  margin: 0 -10px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--hover-color);
  }

  &--done {
    opacity: 0.75;
  }
}

.wb-todo__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text-color-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--done {
    text-decoration: line-through;
    color: var(--text-color-4);
  }
}

.wb-todo__time {
  font-size: 11px;
  color: var(--text-color-4);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.wb-todo__empty {
  text-align: center;
  padding: 18px 0;
  color: var(--text-color-4);
  font-size: 13px;
}

.wb-todo__done-toggle {
  margin-top: 10px;
  padding-top: 10px;
  border: none;
  border-top: 1px solid var(--divider-color);
  border-radius: 0;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 12px;
  color: var(--text-color-4);
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-color-2);
  }
}

.wb-todo__done {
  padding-top: 6px;
}
</style>
