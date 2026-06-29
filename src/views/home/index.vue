<script setup lang="ts">
import { useUserStore } from '@/store/modules'
import QuickActions from './components/QuickActions.vue'
import RecentActivity from './components/RecentActivity.vue'
import StatCards from './components/StatCards.vue'
import SystemInfo from './components/SystemInfo.vue'
import TrendChart from './components/TrendChart.vue'
import WelcomeBanner from './components/WelcomeBanner.vue'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo?.roleType === 'admin')

const visible = ref(false)
onMounted(() => {
  visible.value = true
})
</script>

<template>
  <div class="db">
    <div class="db__body">
      <WelcomeBanner />

      <template v-if="isAdmin">
        <StatCards :visible="visible" />

        <div class="db__row">
          <TrendChart :visible="visible" />
          <SystemInfo :visible="visible" />
        </div>

        <div class="db__row db__row--wide-left">
          <QuickActions />
          <RecentActivity :visible="visible" />
        </div>
      </template>

      <template v-else>
        <div class="db__row db__row--wide-left">
          <QuickActions />
          <RecentActivity :visible="visible" />
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
