<script setup lang="ts">
import dayjs from 'dayjs'
import { NDescriptions, NDescriptionsItem, NScrollbar, NTag } from 'naive-ui'
import { ref } from 'vue'
import { BasicModal, useModalInner } from '@/components/Modal'
import { operationStatusOptions, operationTypeOptions } from '@/constants'

const detail = ref<any>({})

const [register] = useModalInner((data) => {
  detail.value = data?.record || {}
})

function getLabel(options: any[], value: any) {
  return options.find(o => o.value === value)?.label || value || '-'
}

function getStatusColor(status: string) {
  if (status === 'SUCCESS')
    return 'success'
  if (status === 'FAILED')
    return 'error'
  return 'warning'
}

function getMethodColor(method: string) {
  const map: Record<string, string> = {
    GET: 'success',
    POST: 'info',
    PUT: 'warning',
    DELETE: 'error',
  }
  return map[method] || 'default'
}

function formatDuration(ms: number | null | undefined) {
  if (ms == null)
    return '-'
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`
}
</script>

<template>
  <BasicModal title="日志详情" :width="700" @register="register">
    <NScrollbar style="max-height: 500px">
      <NDescriptions
        bordered
        :column="2"
        label-placement="left"
        :label-width="100"
        size="small"
      >
        <NDescriptionsItem label="操作人">
          {{ detail.username || "-" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="操作类型">
          <NTag :bordered="false" size="small">
            {{ getLabel(operationTypeOptions, detail.operationType) }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="操作模块">
          {{ detail.module || "-" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="请求方法">
          <NTag
            :bordered="false"
            :type="getMethodColor(detail.method) as any"
            size="small"
          >
            {{ detail.method || "-" }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="操作描述" :span="2">
          {{ detail.description || "-" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="请求路径" :span="2">
          {{ detail.url || "-" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="状态">
          <NTag
            :bordered="false"
            :type="getStatusColor(detail.status) as any"
            size="small"
          >
            {{ getLabel(operationStatusOptions, detail.status) }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="耗时">
          {{ formatDuration(detail.duration) }}
        </NDescriptionsItem>
        <NDescriptionsItem label="IP地址">
          {{ detail.ipAddress || "-" }}
        </NDescriptionsItem>
        <NDescriptionsItem label="操作时间">
          {{
            detail.createdTime
              ? dayjs(detail.createdTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"
          }}
        </NDescriptionsItem>
        <NDescriptionsItem label="请求参数" :span="2">
          <n-code :code="detail.params || '-'" language="json" />
        </NDescriptionsItem>
        <NDescriptionsItem label="响应结果" :span="2">
          <n-code :code="detail.result || '-'" language="json" />
        </NDescriptionsItem>
        <NDescriptionsItem label="错误信息" :span="2">
          <span
            :style="{ color: detail.errorMessage ? 'var(--error-color)' : '' }"
          >
            {{ detail.errorMessage || "-" }}
          </span>
        </NDescriptionsItem>
        <NDescriptionsItem label="User-Agent" :span="2">
          {{ detail.userAgent || "-" }}
        </NDescriptionsItem>
      </NDescriptions>
    </NScrollbar>
  </BasicModal>
</template>
