<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { NoticeApi } from '@/api/notice'

const props = defineProps<{
  mine: Dashboard.MineInfo | null
  loading: boolean
  reload: () => void
}>()

const router = useRouter()
const markingId = ref<number | null>(null)

/** 未读优先,其次置顶,再按分配时间倒序 */
const sortedNotices = computed(() => {
  const list = [...(props.mine?.notice.recent ?? [])]
  return list.sort((a, b) => {
    if (!!a.readTime !== !!b.readTime)
      return a.readTime ? 1 : -1
    if (a.isPinned !== b.isPinned)
      return a.isPinned ? -1 : 1
    return dayjs(b.assignedTime).valueOf() - dayjs(a.assignedTime).valueOf()
  })
})

const typeMeta: Record<string, { label: string, color: string }> = {
  NOTICE: { label: '通知', color: '#2080f0' },
  INFO: { label: '信息', color: '#18a058' },
  ACTIVITY: { label: '活动', color: '#f0a020' },
}

function formatTime(time: string | null): string {
  if (!time)
    return '-'
  const d = dayjs(time)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return '昨天'
  return d.format('MM/DD')
}

/** 点击行:未读则标记已读并刷新(不跳页,保持工作台上下文) */
async function markRead(item: Dashboard.MineNoticeItem) {
  if (item.readTime || markingId.value !== null)
    return
  markingId.value = item.noticeId
  try {
    await NoticeApi.markNoticeRead(item.noticeId)
    props.reload()
  }
  catch {
    /* 标记失败不打断 */
  }
  finally {
    markingId.value = null
  }
}

function viewDetail() {
  router.push('/notice/notice')
}
</script>

<template>
  <AppCard title="我的公告">
    <template #header-extra>
      <n-badge :value="mine?.notice.unreadCount ?? 0" :max="99" :show="(mine?.notice.unreadCount ?? 0) > 0">
        <button class="wn__view" @click="viewDetail">
          全部公告
        </button>
      </n-badge>
    </template>

    <n-skeleton v-if="loading" :repeat="5" text />
    <div v-else-if="sortedNotices.length === 0" class="wn__empty">
      暂无公告
    </div>
    <div v-else class="wn__list">
      <div
        v-for="(item, i) in sortedNotices"
        :key="item.id"
        class="wn__item"
        :class="{ 'wn__item--unread': !item.readTime }"
        :style="{ '--i': i }"
        role="button"
        tabindex="0"
        @click="markRead(item)"
        @keydown.enter="markRead(item)"
      >
        <div class="wn__head">
          <div class="wn__tags">
            <span
              v-if="typeMeta[item.type]"
              class="wn__tag"
              :style="{
                background: `${typeMeta[item.type].color}18`,
                color: typeMeta[item.type].color,
              }"
            >
              {{ typeMeta[item.type].label }}
            </span>
            <span v-if="item.isPinned" class="wn__tag wn__tag--pinned">置顶</span>
            <span v-if="item.isMandatory" class="wn__tag wn__tag--must">必读</span>
            <span v-if="!item.readTime" class="wn__dot" />
          </div>
          <span class="wn__time">{{ formatTime(item.publishedAt) }}</span>
        </div>
        <div class="wn__title" :class="{ 'wn__title--read': !!item.readTime }" :title="item.title">
          {{ item.title }}
        </div>
      </div>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
.wn__view {
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

.wn__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wn__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  margin: 0 -12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  animation: noticeIn 0.35s ease both;
  animation-delay: calc(var(--i) * 0.04s);

  &:hover {
    background: var(--hover-color);
  }

  &--unread {
    background: color-mix(in srgb, var(--primary-color) 4%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }
  }
}

@keyframes noticeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.wn__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.wn__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.wn__tag {
  padding: 0 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.7;
  flex-shrink: 0;

  &--pinned {
    background: color-mix(in srgb, rgb(212, 168, 83) 14%, transparent);
    color: rgb(212, 168, 83);
  }

  &--must {
    background: color-mix(in srgb, #d03050 12%, transparent);
    color: #d03050;
  }
}

.wn__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d03050;
  box-shadow: 0 0 6px rgba(208, 48, 80, 0.5);
  flex-shrink: 0;
}

.wn__time {
  font-size: 11px;
  color: var(--text-color-4);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.wn__title {
  font-size: 13px;
  color: var(--text-color-1);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--read {
    color: var(--text-color-3);
    font-weight: 400;
  }
}

.wn__empty {
  text-align: center;
  padding: 24px 0;
  color: var(--text-color-4);
  font-size: 13px;
}
</style>
