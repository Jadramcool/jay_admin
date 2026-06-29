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
  <div class="dashboard">
    <div class="dashboard__ambient" aria-hidden="true">
      <div class="dashboard__glow dashboard__glow--a" />
      <div class="dashboard__glow dashboard__glow--b" />
      <div class="dashboard__grain" />
    </div>

    <div class="dashboard__body">
      <WelcomeBanner />

      <template v-if="isAdmin">
        <StatCards :visible="visible" />

        <n-grid cols="1 l:3" :x-gap="14" :y-gap="14">
          <n-gi :span="2">
            <TrendChart :visible="visible" />
          </n-gi>
          <n-gi :span="1">
            <SystemInfo :visible="visible" />
          </n-gi>
        </n-grid>

        <n-grid cols="1 l:3" :x-gap="14" :y-gap="14">
          <n-gi :span="1">
            <QuickActions />
          </n-gi>
          <n-gi :span="2">
            <RecentActivity :visible="visible" />
          </n-gi>
        </n-grid>
      </template>

      <template v-else>
        <n-grid cols="1 l:3" :x-gap="14" :y-gap="14">
          <n-gi :span="1">
            <QuickActions />
          </n-gi>
          <n-gi :span="2">
            <RecentActivity :visible="visible" />
          </n-gi>
        </n-grid>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  position: relative;
  margin: -14px;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(24, 160, 88, 0.06), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(32, 128, 240, 0.05), transparent),
    color-mix(in srgb, var(--card-color) 35%, var(--body-color, #f4f5f7));
}

html.dark .dashboard {
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(24, 160, 88, 0.08), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(32, 128, 240, 0.06), transparent),
    color-mix(in srgb, var(--card-color) 25%, rgb(20, 20, 24));
}

.dashboard__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.dashboard__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;

  &--a {
    width: 380px;
    height: 380px;
    top: -150px;
    right: -80px;
    background: rgba(24, 160, 88, 0.15);
  }

  &--b {
    width: 280px;
    height: 280px;
    bottom: -90px;
    left: -50px;
    background: rgba(32, 128, 240, 0.12);
  }
}

.dashboard__grain {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
  mix-blend-mode: overlay;
}

html.dark .dashboard__grain {
  opacity: 0.18;
  mix-blend-mode: soft-light;
}

.dashboard__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 24px 20px;
  min-height: 100%;
}

@media (max-width: 768px) {
  .dashboard__body {
    padding: 12px 12px 16px;
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
