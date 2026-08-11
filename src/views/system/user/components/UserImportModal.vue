<script setup lang="ts">
import type { UserImportResult } from '@/api/system'
import { ref } from 'vue'
import { UserManagerApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'
import { downloadBlob } from '@/utils/download'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const result = ref<UserImportResult | null>(null)

const [registerModal, { closeModal }] = useModalInner(() => {
  // 每次打开弹窗时重置状态
  selectedFile.value = null
  result.value = null
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function handleDownloadTemplate() {
  try {
    const blob = await UserManagerApi.downloadImportTemplate()
    downloadBlob(blob, '用户导入模板.xlsx')
  }
  catch {
    /* handled by interceptor */
  }
}

async function handleImport() {
  if (!selectedFile.value) {
    window.$message?.warning?.('请先选择 Excel 文件')
    return
  }
  uploading.value = true
  try {
    const res = await UserManagerApi.importExcel(selectedFile.value)
    result.value = res
    if (res.success > 0) {
      window.$message?.success?.(`导入成功 ${res.success} 条`)
      closeModal()
      emit('success')
    }
    else {
      window.$message?.warning?.('导入失败,请查看错误明细')
    }
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <BasicModal
    title="导入用户"
    draggable
    :mask-closable="false"
    :ok-text="uploading ? '导入中...' : '开始导入'"
    @register="registerModal"
    @ok="handleImport"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between text-sm">
        <span style="color: var(--card-sub-text)">
          请先下载模板，按模板格式填写后上传（用户名必填）
        </span>
        <n-button text type="primary" size="small" @click="handleDownloadTemplate">
          下载模板
        </n-button>
      </div>

      <input
        type="file"
        accept=".xlsx,.xls"
        class="block w-full text-sm"
        @change="handleFileChange"
      >
      <p v-if="selectedFile" class="text-sm">
        {{ selectedFile.name }}
      </p>

      <template v-if="result">
        <n-alert :type="result.failed.length > 0 ? 'warning' : 'success'" :show-icon="false">
          共 {{ result.total }} 条：成功 {{ result.success }} 条，失败 {{ result.failed.length }} 条
        </n-alert>
        <n-table v-if="result.failed.length > 0" size="small">
          <thead>
            <tr>
              <th style="width: 80px">
                行号
              </th>
              <th>失败原因</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in result.failed" :key="item.row">
              <td>{{ item.row }}</td>
              <td>{{ item.errors.join('；') }}</td>
            </tr>
          </tbody>
        </n-table>
      </template>
    </div>
  </BasicModal>
</template>
