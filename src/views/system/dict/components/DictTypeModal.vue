<script setup lang="ts">
import { reactive, ref } from 'vue'
import { DictApi } from '@/api/system'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)

const formData = reactive({
  id: 0,
  code: '',
  name: '',
  remark: '',
})

const [registerModal, { closeModal }] = useModalInner((data?: System.DictType) => {
  formData.id = data?.id ?? 0
  formData.code = data?.code ?? ''
  formData.name = data?.name ?? ''
  formData.remark = data?.remark ?? ''
  isEdit.value = Boolean(data?.id)
})

const rules = {
  code: [{ required: true, message: '请输入字典类型编码', trigger: ['blur', 'input'] }],
  name: [{ required: true, message: '请输入字典类型名称', trigger: ['blur', 'input'] }],
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await DictApi.updateType({ ...formData })
    }
    else {
      await DictApi.createType({ ...formData })
    }
    window.$message?.success?.(isEdit.value ? '更新成功' : '创建成功')
    closeModal()
    emit('success')
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <BasicModal
    :title="isEdit ? '编辑字典类型' : '新增字典类型'"
    :ok-text="submitting ? '提交中...' : '确定'"
    :mask-closable="false"
    @register="registerModal"
    @ok="handleSubmit"
  >
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="90">
      <n-form-item label="类型编码" path="code">
        <n-input v-model:value="formData.code" placeholder="如 sex" :disabled="isEdit" maxlength="50" show-count />
      </n-form-item>
      <n-form-item label="类型名称" path="name">
        <n-input v-model:value="formData.name" placeholder="如 性别" maxlength="50" show-count />
      </n-form-item>
      <n-form-item label="备注" path="remark">
        <n-input v-model:value="formData.remark" type="textarea" placeholder="可选" maxlength="255" show-count />
      </n-form-item>
    </n-form>
  </BasicModal>
</template>
