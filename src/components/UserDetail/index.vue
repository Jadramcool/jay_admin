<script setup lang="ts">
import { ref } from 'vue'
import { Description } from '@/components/Description'
import { BasicModal, useModalInner } from '@/components/Modal'
import { useUserDetailSchema } from './schema'

const detail = ref<any>({})

const [register] = useModalInner((data) => {
  detail.value = data?.record || {}
})

const { basicSchemas, otherSchemas } = useUserDetailSchema()
</script>

<template>
  <BasicModal
    :title="`用户详情 - ${detail.name || detail.username || ''}`"
    :width="700"
    @register="register"
  >
    <n-scrollbar style="max-height: 500px">
      <h3
        style="margin-bottom: 8px; font-size: 14px; color: var(--text-color-2)"
      >
        基本信息
      </h3>
      <Description
        :bordered="false"
        :column="2"
        label-placement="left"
        :label-width="100"
        size="small"
        :data="detail"
        :schemas="basicSchemas"
        style="margin-bottom: 16px"
      />

      <h3
        style="margin-bottom: 8px; font-size: 14px; color: var(--text-color-2)"
      >
        其他信息
      </h3>
      <Description
        :bordered="false"
        :column="2"
        label-placement="left"
        :label-width="100"
        size="small"
        :data="detail"
        :schemas="otherSchemas"
      />
    </n-scrollbar>
  </BasicModal>
</template>
