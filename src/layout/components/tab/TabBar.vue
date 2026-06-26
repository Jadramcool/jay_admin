<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import type { RouteLocationNormalized } from 'vue-router'
import { computed, nextTick, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useRouter } from 'vue-router'
import { useTabStore } from '@/store/modules'

const tabStore = useTabStore()
const router = useRouter()

// Context-menu state — x/y position and target tab
const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)
const contextTab = ref<RouteLocationNormalized | null>(null)

// Scroll container for wheel-based horizontal scrolling
const tabsRef = ref<HTMLElement | null>(null)

// Props passed down to the internal TransitionGroup rendered by VueDraggable
const transitionGroupData = computed(() => ({
  name: 'tab-move',
  tag: 'div',
  class: 'tab-list',
}))

// ─── Tab click ─────────────────────────────────────────────
function handleTabClick(tab: RouteLocationNormalized) {
  if (tab.path !== router.currentRoute.value.path) {
    router.push(tab.path)
  }
}

// ─── Overflow menu ─────────────────────────────────────────
const overflowOptions = computed<DropdownMixedOption[]>(() =>
  tabStore.tabs.map(tab => ({
    label: tab.meta?.title || '未命名',
    key: tab.path,
  })),
)

function handleOverflowSelect(key: string) {
  if (key !== router.currentRoute.value.path) {
    router.push(key)
  }
}

// ─── Context menu — built dynamically based on tab state ───
function isActiveTab(tab: RouteLocationNormalized): boolean {
  return tab.path === tabStore.activeTab
}

const dropdownOptions = computed<DropdownOption[]>(() => {
  const currentTab = contextTab.value
  if (!currentTab)
    return []
  const isActive = isActiveTab(currentTab)
  const options: DropdownOption[] = [{ label: '刷新', key: 'refresh' }]
  if (tabStore.tabs.length > 1) {
    options.push({ type: 'divider' as const, key: 'd1' })
    // "关闭当前" 仅对激活 tab 显示，非激活 tab 点击后会自动切换过去
    if (isActive) {
      options.push({ label: '关闭当前', key: 'closeCurrent' })
    }
    options.push(
      { label: '关闭其他', key: 'closeOthers' },
      { label: '关闭左侧', key: 'closeLeft' },
      { label: '关闭右侧', key: 'closeRight' },
    )
    options.push({ type: 'divider' as const, key: 'd2' })
    options.push({ label: '关闭所有', key: 'closeAll' })
  }
  return options
})

// ─── Tab operations ────────────────────────────────────────
// Called from n-tabs @close and the X button click.
// After removing a tab, navigates to the last remaining tab if the active one was closed.
function handleClose(name: string) {
  tabStore.closeTab(name)
  const currentPath = router.currentRoute.value.path
  if (!tabStore.tabs.some(t => t.path === currentPath)) {
    const target = tabStore.tabs[tabStore.tabs.length - 1]
    if (target)
      router.push(target.path)
  }
}

function handleContextMenu(e: MouseEvent, tab: RouteLocationNormalized) {
  // Reset then reposition — ensures correct menu placement on successive right-clicks
  showDropdown.value = false
  dropdownX.value = e.clientX
  dropdownY.value = e.clientY
  contextTab.value = tab
  nextTick(() => {
    showDropdown.value = true
  })
}

function handleDropdownSelect(key: string) {
  showDropdown.value = false
  const currentTab = contextTab.value
  if (!currentTab)
    return

  switch (key) {
    case 'refresh':
      refreshTab(currentTab)
      break
    case 'closeCurrent':
      closeTabInternal(currentTab)
      break
    case 'closeOthers':
      closeOthersInternal(currentTab)
      break
    case 'closeLeft':
      closeLeftInternal(currentTab)
      break
    case 'closeRight':
      closeRightInternal(currentTab)
      break
    case 'closeAll':
      closeAllInternal()
      break
  }
}

// 通过 /redirect 路由重新进入目标页面，触发组件重建实现刷新
function refreshTab(tab: RouteLocationNormalized) {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === tab.path) {
    const { query, hash } = currentRoute
    router.replace({ path: `/redirect${tab.path}`, query, hash })
  }
}

function closeTabInternal(tab: RouteLocationNormalized) {
  const closedPath = tab.path
  tabStore.closeTab(closedPath)
  const currentPath = router.currentRoute.value.path
  if (closedPath === currentPath) {
    const target = tabStore.tabs[tabStore.tabs.length - 1]
    if (target)
      router.push(target.path)
  }
}

function closeOthersInternal(tab: RouteLocationNormalized) {
  tabStore.closeOtherTabs(tab.path)
  if (router.currentRoute.value.path !== tab.path) {
    router.push(tab.path)
  }
}

function closeLeftInternal(tab: RouteLocationNormalized) {
  tabStore.closeLeftTabs(tab.path)
  if (router.currentRoute.value.path !== tab.path) {
    router.push(tab.path)
  }
}

function closeRightInternal(tab: RouteLocationNormalized) {
  tabStore.closeRightTabs(tab.path)
  if (router.currentRoute.value.path !== tab.path) {
    router.push(tab.path)
  }
}

function closeAllInternal() {
  tabStore.closeAllTabs()
  router.push('/home')
}

// ─── Scroll: 鼠标滚轮横移 tabs ────────────────────────────
function handleWheel(e: WheelEvent) {
  const el = tabsRef.value
  if (!el)
    return
  el.scrollBy({
    left: e.deltaY > 0 ? 60 : -60,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="tab-bar-wrapper">
    <div
      ref="tabsRef"
      class="tabs-scroll-container"
      @wheel.prevent="handleWheel"
    >
      <!--
        VueDraggable with tag="transition-group": avoids extra DOM layer that would
        break SortableJS handle selector. component-data passes TransitionGroup props.
      -->
      <VueDraggable
        v-model="tabStore.tabs"
        tag="transition-group"
        handle=".tab-label"
        ghost-class="tab-ghost"
        chosen-class="tab-chosen"
        drag-class="tab-dragging"
        :animation="250"
        :component-data="transitionGroupData"
        :scroll="true"
        :scroll-sensitivity="50"
        :scroll-speed="10"
      >
        <div
          v-for="(tab, index) in tabStore.tabs"
          :key="tab.path"
          class="tab-item text-xs"
          :class="{ 'is-active': tabStore.activeTab === tab.path }"
          @click="handleTabClick(tab)"
        >
          <!-- Active indicator bar -->
          <span class="tab-active-bar" />

          <!--
            Separator line — hidden when either this tab or the previous one is active,
            because the active tab's border already provides visual separation.
          -->
          <span
            v-if="index > 0"
            class="tab-separator"
            :class="{
              'is-hidden':
                tabStore.activeTab === tab.path
                || tabStore.activeTab === tabStore.tabs[index - 1]?.path,
            }"
          />

          <div
            class="tab-label"
            @contextmenu.prevent="handleContextMenu($event, tab)"
          >
            <JIcon
              v-if="tab.meta?.icon"
              :icon="tab.meta.icon as string"
              :size="14"
              class="tab-icon"
            />
            <span class="tab-title text-xs">{{ tab.meta?.title || "未命名" }}</span>
            <!--
              @mousedown.stop prevents drag handle activation when clicking close,
              so closing a tab never triggers vue-draggable.
            -->
            <span
              v-if="tabStore.tabs.length > 1"
              class="tab-close"
              @mousedown.stop
              @click.stop="handleClose(tab.path)"
            >
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path
                  fill="currentColor"
                  d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06z"
                />
              </svg>
            </span>
          </div>
        </div>
      </VueDraggable>
    </div>

    <!-- Overflow dropdown: lists all open tabs for quick navigation when tabs overflow -->
    <div class="tab-bar-actions">
      <n-dropdown
        trigger="click"
        :options="overflowOptions"
        @select="handleOverflowSelect"
      >
        <n-button text size="tiny" class="overflow-btn">
          <template #icon>
            <n-icon size="16">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M4 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM4 9a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"
                />
              </svg>
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </div>

    <!-- Context menu: right-click on any tab -->
    <n-dropdown
      :show="showDropdown"
      :x="dropdownX"
      :y="dropdownY"
      :options="dropdownOptions"
      @clickoutside="showDropdown = false"
      @select="handleDropdownSelect"
    />
  </div>
</template>

<style lang="scss" scoped>
/* ================================================================
   TAB BAR — 完整 UI 增强
   ================================================================ */

/* ─── Wrapper ────────────────────────────────────────── */
.tab-bar-wrapper {
  height: 40px;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  background: var(--layout-bg);
  border-bottom: 1px solid var(--layout-border);

  /* ─── Scroll container ───────────────────────────────── */
  .tabs-scroll-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* ── 非激活状态 ── */
  .tab-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 10px 0 14px;
    margin: 4px 1px 0;
    line-height: 32px;
    border-radius: 6px 6px 0 0;
    color: var(--layout-text-secondary);
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    background: var(--layout-bg-secondary);

    /* ── 边框：每个 tab 有完整边框 ── */
    border: 1px solid transparent;
    border-bottom: none;

    /* ── 悬浮 & 切换过渡 ── */
    transition:
      color 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease;

    /* ── 悬浮效果 ── */
    &:not(.is-active):hover {
      color: var(--layout-text-hover);
      background: var(--layout-bg-hover);
      border-color: var(--layout-border-light);
      box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.04);
    }

    /* ── 激活状态 ── */
    &.is-active {
      color: var(--primary-color, #18a058);
      font-weight: 500;
      background: var(--layout-bg);
      border-color: var(--layout-border);
      border-bottom-color: var(--layout-bg);
      margin-bottom: -1px;
      box-shadow:
        0 -1px 4px rgba(0, 0, 0, 0.06),
        1px 0 3px rgba(0, 0, 0, 0.03),
        -1px 0 3px rgba(0, 0, 0, 0.03);
      z-index: 1;
    }

    /* ── 激活 tab 底部主题色条 ── */
    .tab-active-bar {
      display: none;
      position: absolute;
      left: 6px;
      right: 6px;
      bottom: -1px;
      height: 2.5px;
      background: var(--primary-color, #18a058);
      border-radius: 3px 3px 0 0;
      z-index: 2;
    }

    &.is-active .tab-active-bar {
      display: block;
      /* 入场动画：弹性放大，cubic-bezier 带轻微过冲 */
      animation: activeBarIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ── Tab 之间的分割线 ── */
    .tab-separator {
      position: absolute;
      left: -4px;
      top: 8px;
      bottom: 8px;
      width: 1px;
      background: var(--layout-separator);
      pointer-events: none;
      transition: opacity 0.2s ease;

      /* 相邻激活 tab 隐藏分割线，激活边框已提供视觉边界 */
      &.is-hidden {
        opacity: 0;
      }
    }

    /* ─── Drag handle area ───────────────────────────────── */
    .tab-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 100%;
      cursor: pointer;
      position: relative;
      z-index: 1;

      &:active {
        cursor: grabbing;
      }
    }

    /* ─── Tab title text ─────────────────────────────────── */
    .tab-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 120px;
      line-height: 1;
      pointer-events: none;
      letter-spacing: 0.01em;
    }

    /* Route icon inside tab label */
    .tab-icon {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
    }

    /* ─── Close button ───────────────────────────────────── */
    /* 默认隐藏，hover 到 tab 或 tab 激活时才显示 */
    .tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      opacity: 0;
      transition:
        opacity 0.2s,
        background 0.2s,
        transform 0.2s;
      flex-shrink: 0;
      color: var(--layout-text-secondary);
      pointer-events: auto;
      transform: scale(0.85);
    }

    &:hover .tab-close {
      opacity: 0.7;
      transform: scale(1);
    }

    &.is-active .tab-close {
      opacity: 0.7;
      transform: scale(1);
    }

    .tab-close:hover {
      opacity: 1 !important;
      background: rgba(128, 128, 128, 0.12);
      color: var(--layout-text-hover);
      transform: scale(1.1) !important;
    }
  }

  /* ─── Overflow menu button ───────────────────────────── */
  .tab-bar-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 6px;
    border-left: 1px solid var(--layout-border);
    background: var(--layout-bg);
    position: relative;
    z-index: 2;

    .overflow-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition:
        background 0.2s ease,
        transform 0.2s ease;

      &:hover {
        background: rgba(128, 128, 128, 0.08);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

@keyframes activeBarIn {
  from {
    opacity: 0;
    transform: scaleX(0.4);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

/* ─── Draggable tab list ─────────────────────────────── */
.tab-list {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  height: 40px;
  min-width: fit-content;
  padding: 0 6px;
}

/* ── Tab 移入/移出动画 ── */
.tab-move-enter-active {
  transition: all 0.2s ease-out;
}
.tab-move-leave-active {
  transition: all 0.2s ease-in;
  overflow: hidden;
}
.tab-move-enter-from {
  opacity: 0;
  transform: translateX(-16px) scale(0.85);
}
.tab-move-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
/* 相邻 tab 平滑让位，与 VueDraggable 的 :animation="250" 协调 */
.tab-move-move {
  transition: transform 0.25s ease;
}

/* ─── Draggable-plus states ──────────────────────────── */
/* 占位 tab：原始位置留下的半透明影子 */
.tab-ghost {
  opacity: 0.3;
  outline: none;
}
/* 正在拖拽的 tab：放大 + 主题色边框 + 浮起阴影 */
.tab-dragging {
  opacity: 0.95 !important;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    0 1px 4px rgba(0, 0, 0, 0.08) !important;
  transform: scale(1.02) !important;
  border-color: var(--primary-color, #18a058) !important;
  z-index: 999;
}
</style>
