<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{
  visible: boolean
}>()

const sysInfo = ref<Dashboard.SystemInfo | null>(null)
const loading = ref(true)

const resources = computed(() => [
  { label: 'CPU', value: sysInfo.value?.cpu ?? 0, icon: 'icon-park-outline:computer', color: '#18a058' },
  { label: '内存', value: sysInfo.value?.memory ?? 0, icon: 'icon-park-outline:memory', color: '#2080f0' },
  { label: '磁盘', value: sysInfo.value?.disk ?? 0, icon: 'icon-park-outline:hard-disk', color: '#f0a020' },
])

watch(() => props.visible, (v) => {
  if (v && !sysInfo.value)
    loadSysInfo()
}, { immediate: true })

async function loadSysInfo() {
  loading.value = true
  try {
    sysInfo.value = await DashboardApi.systemInfo()
  }
  catch {
    // ignore
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <n-card title="系统信息" size="small" :bordered="false" class="sys-card">
    <n-skeleton v-if="loading" :repeat="5" text />
    <template v-else>
      <div v-for="res in resources" :key="res.label" class="sys-resource">
        <div class="sys-resource__header">
          <div class="sys-resource__label">
            <Icon :icon="res.icon" class="sys-resource__icon" :style="{ color: res.color }" />
            <span>{{ res.label }}</span>
          </div>
          <span class="sys-resource__value" :style="{ color: res.color }">
            {{ res.value }}%
          </span>
        </div>
        <n-progress
          type="line"
          :percentage="res.value"
          :color="res.color"
          :rail-color="`${res.color}15`"
          :height="6"
          :border-radius="3"
          indicator-placement="inside"
        />
      </div>

      <div class="sys-meta">
        <div class="sys-meta__item">
          <span class="sys-meta__label">运行时间</span>
          <span class="sys-meta__value">{{ sysInfo?.uptime ?? '-' }}</span>
        </div>
        <div class="sys-meta__item">
          <span class="sys-meta__label">系统版本</span>
          <span class="sys-meta__value">v{{ sysInfo?.version ?? '-' }}</span>
        </div>
        <div class="sys-meta__item">
          <span class="sys-meta__label">Node.js</span>
          <span class="sys-meta__value">{{ sysInfo?.nodeVersion ?? '-' }}</span>
        </div>
        <div class="sys-meta__item">
          <span class="sys-meta__label">平台</span>
          <span class="sys-meta__value">{{ sysInfo?.platform ?? '-' }}</span>
        </div>
        <div class="sys-meta__item">
          <span class="sys-meta__label">数据记录</span>
          <span class="sys-meta__value">{{ sysInfo?.dbRecords ?? '-' }}</span>
        </div>
      </div>
    </template>
  </n-card>
</template>

<style lang="scss" scoped>
.sys-card {
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 100%;

  :deep(.n-card-header) {
    padding: 14px 18px !important;
  }

  :deep(.n-card-header__title) {
    font-size: 14px !important;
    font-weight: 700 !important;
  }

  :deep(.n-card__content) {
    padding: 0 18px 14px !important;
  }
}

.sys-resource {
  margin-bottom: 14px;
}

.sys-resource__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sys-resource__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-color-2);
  font-weight: 500;
}

.sys-resource__icon {
  font-size: 16px;
}

.sys-resource__value {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.sys-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--divider-color);
}

.sys-meta__item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sys-meta__label {
  font-size: 11.5px;
  color: var(--text-color-4);
}

.sys-meta__value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}
</style>
