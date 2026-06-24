<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { reactive, ref } from 'vue'
import { UserManagerApi } from '@/api/notice'
import { useModalInner } from '@/components/Modal/src/hooks/useModal'

const emit = defineEmits<{
  success: []
  register: [instance: any, uuid: number]
}>()
const formRef = ref<FormInst | null>(null)
const userId = ref<number>(0)

const formData = reactive({ newPassword: '', confirmPassword: '' })

const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_: any, v: string) => v === formData.newPassword,
      message: '两次密码不一致',
      trigger: 'blur',
    },
  ],
}

const [registerModal, { closeModal }] = useModalInner((data: any) => {
  if (data?.record) {
    userId.value = data.record.id
    formData.newPassword = ''
    formData.confirmPassword = ''
  }
})

async function handleOk() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return
  }
  await UserManagerApi.resetPassword(userId.value, formData.newPassword)
  window.$message?.success?.('密码重置成功')
  closeModal()
  emit('success')
}
</script>

<template>
  <BasicModal title="重置密码" @register="registerModal" @ok="handleOk">
    <n-form ref="formRef" :model="formData" :rules="rules">
      <n-form-item label="新密码" path="newPassword">
        <n-input
          v-model:value="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="确认密码" path="confirmPassword">
        <n-input
          v-model:value="formData.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password-on="click"
        />
      </n-form-item>
    </n-form>
  </BasicModal>
</template>
