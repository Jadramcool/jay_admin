<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserManagerApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useUserSchema } from './schema'

const route = useRoute()
const router = useRouter()

const userId = route.params.id as string | undefined
const isUpdate = ref(Boolean(userId))

// CreateUserDto 的 password 必填,但编辑场景可不改密码(更新走 UpdateUserDto)
type UserEditFormValues = Omit<System.UserCreatePayload, 'password'> & {
  id?: number
  password?: string
}

const { editFormSchemas } = useUserSchema({ isCreate: !isUpdate.value })

const [registerForm, { setFieldsValue }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: true,
})

onMounted(async () => {
  if (isUpdate.value) {
    try {
      const detail = await UserManagerApi.detail(Number(userId))
      const formData = {
        ...detail,
        roleIds: detail.roles?.map(role => role.id) || [],
      }
      setFieldsValue(formData)
    }
    catch {
      goBack()
    }
  }
})

async function handleSubmit(values: Record<string, unknown>) {
  try {
    const payload: UserEditFormValues = {
      ...values,
      username: String(values.username ?? ''),
    }
    if (isUpdate.value && !payload.password)
      delete payload.password

    if (isUpdate.value) {
      await UserManagerApi.update({ ...payload, id: Number(userId) })
      window.$message?.success?.('更新成功')
    }
    else {
      // 新增场景密码必填(与 CreateUserDto 一致)
      const password = payload.password
      if (!password) {
        window.$message?.warning?.('请输入密码')
        return
      }
      await UserManagerApi.create({ ...payload, password })
      window.$message?.success?.('创建成功')
    }
    goBack()
  }
  catch {}
}

function goBack() {
  // 列表页路由由菜单 path 注册,不是 /system/user/list
  router.push('/system/user')
}
</script>

<template>
  <div>
    <n-page-header class="mb-4">
      <template #title>
        {{ isUpdate ? "编辑用户" : "新增用户" }}
      </template>
      <template #extra>
        <n-button variant="text" @click="goBack">
          返回
        </n-button>
      </template>
    </n-page-header>

    <n-card :bordered="false" embedded>
      <FormEdit
        show-reset-button
        :submit-button-text="isUpdate ? '更新' : '创建'"
        @register="registerForm"
        @submit="handleSubmit"
      />
    </n-card>
  </div>
</template>
