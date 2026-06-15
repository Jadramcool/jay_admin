<script setup lang="ts" name="BasicModalFooter">
import { footerProps } from '../props'

defineOptions({ name: 'BasicModalFooter' })

const props = defineProps({
  ...footerProps,
})

const emit = defineEmits<{ close: [], ok: [] }>()

function handleClose() {
  emit('close')
}
function handleOk() {
  emit('ok')
}
</script>

<template>
  <n-space>
    <n-button v-if="props.showCancelButton" @click="handleClose">
      {{ props.cancelText }}
    </n-button>
    <n-button
      v-if="props.showOkButton"
      :type="props.okType"
      :loading="props.confirmLoading"
      @click="handleOk"
    >
      {{ props.okText }}
    </n-button>
  </n-space>
</template>
