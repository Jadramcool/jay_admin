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
    <div class="db__bg" aria-hidden="true">
      <div class="db__grain" />
    </div>

    <div class="db__body">
      <WelcomeBanner />

      <template v-if="isAdmin">
        <StatCards :visible="visible" />

        <div class="db__cols-3">
          <div class="db__span-2">
            <TrendChart :visible="visible" />
          </div>
          <div class="db__span-1">
            <SystemInfo :visible="visible" />
          </div>
        </div>

        <div class="db__cols-3">
          <div class="db__span-1">
            <QuickActions />
          </div>
          <div class="db__span-2">
            <RecentActivity :visible="visible" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="db__cols-3">
          <div class="db__span-1">
            <QuickActions />
          </div>
          <div class="db__span-2">
            <RecentActivity :visible="visible" />
          </div>
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

.db__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.db__grain {
  position: absolute;
  inset: 0;
  opacity: 0.25;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 160px 160px;
  mix-blend-mode: overlay;

  html.dark & {
    opacity: 0.08;
    mix-blend-mode: soft-light;
  }
}

.db__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 24px 20px;
  min-height: 100%;
}

.db__cols-3 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;

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
