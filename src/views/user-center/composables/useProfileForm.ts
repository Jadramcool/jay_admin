import type { UploadCustomRequestOptions } from 'naive-ui'
import { UploadApi } from '@/api/upload'
import { UserApi } from '@/api/user/user'
import { roleTypeOptions } from '@/constants'
import { useUserStore } from '@/store/modules'
import { resolveUploadUrl } from '@/utils'

export function useProfileForm() {
  const userStore = useUserStore()

  const userInfo = reactive<Api.UserInfo>({} as Api.UserInfo)

  const avatarUrl = computed(() => resolveUploadUrl(userStore.userInfo?.avatar))

  const roleTypeLabel = computed(() =>
    userInfo.roleType
      ? roleTypeOptions.find(o => o.value === userInfo.roleType)?.label || userInfo.roleType
      : '',
  )

  async function loadUserInfo() {
    // If store already has data, pre-fill immediately for fast first paint
    if (userStore.userInfo?.id) {
      Object.assign(userInfo, userStore.userInfo)
    }
    try {
      const data = await UserApi.getUserInfo()
      userStore.setUser(data)
      Object.assign(userInfo, data)
    }
    catch {}
  }

  async function handleAvatarUpload({ file }: UploadCustomRequestOptions) {
    if (!file.file) {
      window.$message?.error?.('文件读取失败，请重试')
      return
    }
    try {
      const formData = new FormData()
      formData.append('file', file.file)
      const res = await UploadApi.upload(formData)
      await UserApi.updateUser({ avatar: res.url })
      await loadUserInfo()
      window.$message?.success?.('头像更新成功')
    }
    catch {}
  }

  return {
    userInfo,
    avatarUrl,
    roleTypeLabel,
    loadUserInfo,
    handleAvatarUpload,
  }
}
