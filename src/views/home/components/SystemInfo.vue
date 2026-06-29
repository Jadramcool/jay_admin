<script setup lang="ts">
import { DashboardApi } from '@/api/dashboard'

const props = defineProps<{ visible: boolean }>()

const sysInfo = ref<Dashboard.SystemInfo | null>(null)
const loading = ref(true)

const resources = computed(() => [
  { label: 'CPU', value: sysInfo.value?.cpu ?? 0, color: '#18a058' },
  { label: '内存', value: sysInfo.value?.memory ?? 0, color: '#2080f0' },
  { label: '磁盘', value: sysInfo.value?.disk ?? 0, color: '#f0a020' },
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
    /* ignore */
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card card--sys">
    <div class="card__bar" />
    <div class="card__body">
      <h3 class="card__title">
        系统信息
      </h3>
      <n-skeleton v-if="loading" :repeat="5" text />
      <template v-else>
        <div v-for="res in resources" :key="res.label" class="sys__res">
          <div class="sys__res-top">
            <span class="sys__res-label">{{ res.label }}</span>
            <span class="sys__res-val" :style="{ color: res.color }">{{ res.value }}%</span>
          </div>
          <div class="sys__bar" :style="{ '--c': res.color }">
            <div class="sys__bar-fill" :style="{ width: `${res.value}%` }" />
          </div>
        </div>
        <div class="sys__meta">
          <div class="sys__kv">
            <span class="sys__k">运行时间</span>
            <span class="sys__v">{{ sysInfo?.uptime ?? '-' }}</span>
          </div>
          <div class="sys__kv">
            <span class="sys__k">版本</span>
            <span class="sys__v">v{{ sysInfo?.version ?? '-' }}</span>
          </div>
          <div class="sys__kv">
            <span class="sys__k">Node.js</span>
            <span class="sys__v">{{ sysInfo?.nodeVersion ?? '-' }}</span>
          </div>
          <div class="sys__kv">
            <span class="sys__k">平台</span>
            <span class="sys__v">{{ sysInfo?.platform ?? '-' }}</span>
          </div>
          <div class="sys__kv">
            <span class="sys__k">数据记录</span>
            <span class="sys__v">{{ sysInfo?.dbRecords ?? '-' }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  border-radius: 14px;
  overflow: hidden;
  background: color-mix(in srgb, var(--card-color) 92%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 100%;

  html.dark & {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }
}

.card__bar {
  height: 3px;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
}

.card__body {
  padding: 18px 20px 20px;
}

.card__title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color-1);
}

.sys__res {
  margin-bottom: 14px;
}

.sys__res-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sys__res-label {
  font-size: 13px;
  color: var(--text-color-2);
  font-weight: 500;
}

.sys__res-val {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.sys__bar {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--c) 10%, transparent);
  overflow: hidden;
}

.sys__bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--c);
  transition: width 0.6s ease;
}

.sys__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--divider-color);
}

.sys__kv {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sys__k {
  font-size: 11.5px;
  color: var(--text-color-4);
}

.sys__v {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
}
</style>
