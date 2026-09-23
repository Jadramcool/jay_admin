<script setup lang="ts">
import { hasPermission } from '@/utils/common'
import QuickActions from './components/QuickActions.vue'
import RecentActivity from './components/RecentActivity.vue'
import StatCards from './components/StatCards.vue'
import TrendChart from './components/TrendChart.vue'
import WelcomeBanner from './components/WelcomeBanner.vue'
import { useWorkbench } from './components/workbench/useWorkbench'
import WorkbenchNoticeCard from './components/workbench/WorkbenchNoticeCard.vue'
import WorkbenchTodayStrip from './components/workbench/WorkbenchTodayStrip.vue'
import WorkbenchTodoCard from './components/workbench/WorkbenchTodoCard.vue'

// 首页双视图(渲染层选择,不做路由拆分):
// 持有审计查询权(≈运营人员,与 activities 全站动态的权限口径一致)→ 运营看板;否则个人工作台
const isAdminView = computed(() => hasPermission('system:operation-log:list'))

const visible = ref(false)
onMounted(() => {
  visible.value = true
})

// 工作台数据:单请求共享给三张卡片;看板视图下不请求
const { mine, loading, reload } = useWorkbench(visible, computed(() => !isAdminView.value))
</script>

<template>
  <div class="db">
    <div class="db__body">
      <WelcomeBanner />

      <template v-if="isAdminView">
        <StatCards :visible="visible" />

        <TrendChart :visible="visible" />

        <div class="db__row db__row--wide-left">
          <QuickActions />
          <RecentActivity :visible="visible" />
        </div>
      </template>

      <template v-else>
        <WorkbenchTodayStrip :mine="mine" :loading="loading" />

        <div class="db__row">
          <WorkbenchTodoCard :mine="mine" :loading="loading" :reload="reload" />
          <WorkbenchNoticeCard :mine="mine" :loading="loading" :reload="reload" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.db {
  position: relative;
  margin: -14px;
  min-height: 100%;
  overflow: hidden;
  background: var(--body-color);

  html.dark & {
    background: color-mix(in srgb, rgb(12, 12, 16) 100%, var(--body-color));
  }
}

.db__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 24px 20px;
  min-height: 100%;
}

.db__row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;

  &--wide-left {
    grid-template-columns: 1fr 2fr;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .db__body {
    padding: 12px 12px 16px;
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .db * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
