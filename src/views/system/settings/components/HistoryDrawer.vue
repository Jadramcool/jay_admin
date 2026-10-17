<script setup lang="ts">
import { ref, watch } from 'vue'
import { SettingsApi } from '@/api/system'
import { BasicDrawer, useDrawer } from '@/components/Drawer'

/**
 * 设置变更历史 + 回滚。
 *
 * 历史由后端 `setting_history` 提供(每次 set/reset/rollback 一条)。
 * 「回滚」= 恢复到该版本**变更前**的值(变更前为默认值时即恢复默认值),
 * 这一动作会产生一条新的历史记录(source=rollback),不会删除历史。
 * 回滚需要 `system:setting:rollback` 权限。
 *
 * 开关由父组件驱动的"打开令牌"控制:`useDrawer().openDrawer(data)` 无法把 data
 * 交给 useDrawerInner(见 Drawer README 的限制说明),所以这里把 key 和
 * 每次打开的递增令牌都做成 props —— 点同一个设置项也能重新打开。
 */
const props = defineProps<{
  /** 每次点击"历史"自增,用于重新打开(即使 key 未变) */
  token: number
  settingKey: string
  label?: string
}>()

const emit = defineEmits<{
  changed: []
}>()

const canRollback = hasPermission('system:setting:rollback')

const [register, { openDrawer }] = useDrawer()

const loading = ref(false)
const rolling = ref(false)
const items = ref<System.SettingHistoryItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

watch(
  () => props.token,
  () => {
    if (!props.token)
      return
    page.value = 1
    openDrawer()
    void load()
  },
)

// 抽屉已打开时切换设置项 → 重新拉历史
watch(
  () => props.settingKey,
  () => {
    if (!props.token)
      return
    page.value = 1
    void load()
  },
)

async function load() {
  if (!props.settingKey)
    return
  loading.value = true
  try {
    const res = await SettingsApi.history(props.settingKey, {
      page: page.value,
      pageSize: pageSize.value,
    })
    items.value = res.items ?? []
    total.value = res.total ?? 0
  }
  finally {
    loading.value = false
  }
}

async function rollback(item: System.SettingHistoryItem) {
  rolling.value = true
  try {
    await SettingsApi.rollback(props.settingKey, {
      version: item.version,
      reason: `回滚 v${item.version} 的修改`,
    })
    window.$message?.success?.('已回滚')
    await load()
    emit('changed')
  }
  finally {
    rolling.value = false
  }
}

const SOURCE_TEXT: Record<string, string> = {
  api: '在线修改',
  rollback: '回滚',
  migration: '迁移',
  seed: '初始化',
}

function displayValue(value: string | null) {
  if (value === null || value === '')
    return '(默认值)'
  return value.length > 60 ? `${value.slice(0, 60)}…` : value
}
</script>

<template>
  <BasicDrawer
    :width="620"
    :title="`变更历史 · ${label || settingKey}`"
    @register="register"
  >
    <n-spin :show="loading">
      <n-empty v-if="!items.length" description="暂无变更记录" class="py-10" />
      <n-timeline v-else>
        <n-timeline-item
          v-for="item in items"
          :key="item.id"
          type="info"
          :title="`v${item.version} · ${SOURCE_TEXT[item.source] ?? item.source}`"
          :time="new Date(item.changedTime).toLocaleString()"
        >
          <div class="text-sm">
            <div class="break-all">
              <span class="opacity-60">{{ displayValue(item.oldValue) }}</span>
              <span class="mx-1">→</span>
              <span>{{ displayValue(item.newValue) }}</span>
            </div>
            <div class="mt-1 text-xs opacity-60">
              {{ item.changedName || '系统' }}
              <span v-if="item.reason"> · {{ item.reason }}</span>
            </div>
          </div>
          <template #footer>
            <n-button
              v-if="canRollback"
              size="tiny"
              :disabled="rolling"
              @click="rollback(item)"
            >
              回滚此次修改
            </n-button>
          </template>
        </n-timeline-item>
      </n-timeline>
    </n-spin>

    <div v-if="total > pageSize" class="mt-4 flex justify-end">
      <n-pagination
        v-model:page="page"
        :page-size="pageSize"
        :item-count="total"
        @update:page="load"
      />
    </div>
  </BasicDrawer>
</template>
