<script setup lang="ts">
import { ref } from 'vue'
import { Description } from '@/components'
import { BasicModal, useModalInner } from '@/components/Modal'
import { useNoticeDetailSchema } from '../schema.tsx'

defineEmits<{
  register: [instance: any, uuid: number]
}>()

const detail = ref<any>({})

const [register] = useModalInner((data) => {
  detail.value = data?.record || {}
})

const { basicSchemas } = useNoticeDetailSchema()
</script>

<template>
  <BasicModal
    :title="`公告详情 - ${detail.title || ''}`"
    :width="1200"
    :height="700"
    @register="register"
  >
    <Description
      :bordered="true"
      :column="2"
      label-placement="left"
      :label-width="100"
      size="small"
      :data="detail"
      :schemas="basicSchemas"
    />
    <WangEditorPreview :model-value="detail.content || ''" :height="500" />
  </BasicModal>
</template>
