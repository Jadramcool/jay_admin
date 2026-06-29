<script setup lang="ts">
import { h } from 'vue'
import { NoticeApi } from '@/api/notice'
import { useSocket } from '@/composables/useSocket'
import { useAuthStore, useUserStore } from '@/store/modules'
import storage from '@/utils/storage'
import { getToken } from '@/utils/token'

const authStore = useAuthStore()
const userStore = useUserStore()

const { connect, disconnect, on, off } = useSocket()

const timerIds: ReturnType<typeof setTimeout>[] = []
const READ_STORAGE_KEY = 'notice_read'

function getReadSet(): Set<number> {
  const userId = userStore.userInfo?.id
  if (!userId)
    return new Set()
  const stored = storage.get(`${READ_STORAGE_KEY}_${userId}`)
  return new Set<number>(Array.isArray(stored) ? stored : [])
}

function saveReadSet(ids: Set<number>) {
  const userId = userStore.userInfo?.id
  if (!userId)
    return
  storage.set(`${READ_STORAGE_KEY}_${userId}`, Array.from(ids))
}

function markAsRead(id: number) {
  const set = getReadSet()
  set.add(id)
  saveReadSet(set)
  NoticeApi.markNoticeRead(id).catch(() => {})
}

function isRead(id: number): boolean {
  return getReadSet().has(id)
}

/**
 * 展示一条公告
 */
function showNotice(notice: {
  noticeId: number
  id: number
  title: string
  content?: string
  type: string
  isMandatory: boolean
}) {
  const id = notice.noticeId || notice.id
  // 如果本地已标记已读，说明是重推 → 清除缓存以重新展示
  if (isRead(id)) {
    const set = getReadSet()
    set.delete(id)
    saveReadSet(set)
  }

  if (notice.isMandatory) {
    // 强制阅读 → 弹模态框，不可关闭
    window.$dialog?.warning({
      title: notice.title,
      content: () =>
        h('div', {
          class: 'notice-mandatory-content',
          innerHTML: normalizeHtml(notice.content || ''),
        }),
      maskClosable: false,
      closable: false,
      style: { maxHeight: '70vh', overflow: 'auto' },
      positiveText: '我知道了',
      onPositiveClick: () => markAsRead(id),
    })
  }
  else {
    // 普通公告 → 通知栏（不自动消失）
    window.$notification?.info({
      title: notice.title,
      description: truncateContent(notice.content, 120),
      duration: 0,
      closable: true,
      onClose: () => markAsRead(id),
    })
  }
}

/**
 * 限制内容长度
 */
/**
 * 修复 HTML 属性大小写问题（colSpan → colspan 等）
 */
function normalizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/colSpan\b/g, 'colspan')
    .replace(/rowSpan\b/g, 'rowspan')
    .replace(/\bwidth="auto"/g, 'style="width:auto"')
}

function truncateContent(content: string | undefined, maxLen: number): string {
  if (!content)
    return ''
  // 去除 HTML 标签
  const text = content.replace(/<[^>]+>/g, '')
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
}

/**
 * 加载已有的未读公告
 */
async function loadExistingUnread() {
  try {
    const list = await NoticeApi.getUnreadNotices()
    if (Array.isArray(list)) {
      // 逐个弹窗展示，但带延迟防止同时弹出过多
      list.forEach((notice, index) => {
        const timer = setTimeout(() => {
          showNotice(notice as any)
        }, index * 500)
        timerIds.push(timer)
      })
    }
  }
  catch {
    // 静默处理
  }
}

/**
 * 建立 WebSocket 连接
 */
function connectSocket() {
  const token = getToken()
  if (!token)
    return

  connect(token)

  // 监听新公告推送
  on('newNotice', (payload: any) => {
    showNotice(payload)
  })
}

// 用户登录后启动监听
watch(
  () => userStore.userInfo?.id,
  (userId) => {
    if (userId) {
      loadExistingUnread()
      connectSocket()
    }
    else {
      disconnect()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  timerIds.forEach(clearTimeout)
  disconnect()
})
</script>

<template>
  <!-- 无 UI 渲染，纯逻辑组件 -->
</template>

<style lang="scss">
.notice-mandatory-content {
  max-height: 55vh;
  overflow-y: auto;
  line-height: 1.7;
  font-size: 14px;

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
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

  p {
    margin: 6px 0;
  }

  h2 {
    font-size: 18px;
    margin: 12px 0 8px;
  }
}
</style>
