<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { UserApi } from '@/api/user'
import { useAuthStore } from '@/store/modules'

const emit = defineEmits(['success', 'switchToRegister'])

const authStore = useAuthStore()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')
const captchaLoading = ref(false)

const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaId: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不能小于4位', trigger: 'blur' },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const iconColor = computed(() => 'rgba(255,255,255,0.5)')
const checkboxColor = computed(() => 'rgba(255,255,255,0.7)')

/** 加载验证码图片 */
async function loadCaptcha() {
  captchaLoading.value = true
  try {
    const result = await UserApi.getCaptcha()
    formData.captchaId = result.captchaId
    formData.captcha = ''
    captchaImage.value = result.image
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    captchaLoading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
  const saved = localStorage.getItem('REMEMBER_LOGIN')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      formData.username = data.username || ''
      rememberMe.value = true
      // Migrate legacy records that included the plaintext password.
      localStorage.setItem('REMEMBER_LOGIN', JSON.stringify({
        username: formData.username,
      }))
    }
    catch {
      /* ignore */
    }
  }
})

async function handleLogin() {
  try {
    await formRef.value?.validate()
  }
  catch {
    return
  }

  loading.value = true
  try {
    const result = await UserApi.login({
      username: formData.username,
      password: formData.password,
      captcha: formData.captcha,
      captchaId: formData.captchaId,
    })

    authStore.setToken(result)

    if (rememberMe.value) {
      localStorage.setItem('REMEMBER_LOGIN', JSON.stringify({
        username: formData.username,
      }))
    }
    else {
      localStorage.removeItem('REMEMBER_LOGIN')
    }

    emit('success')
  }
  catch {
    // 错误已由全局 errorHandler 统一弹 toast;验证码可能已失效,刷新一张
    loadCaptcha()
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    :show-label="false"
    class="glass-form"
    size="large"
  >
    <n-form-item path="username">
      <n-input
        v-model:value="formData.username"
        placeholder="用户名"
        :maxlength="20"
        class="glass-input"
        :input-props="{ autocomplete: 'username' }"
      >
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <Icon icon="icon-park-outline:user" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="password">
      <n-input
        v-model:value="formData.password"
        type="password"
        placeholder="密码"
        show-password-on="click"
        class="glass-input"
        :input-props="{ autocomplete: 'current-password' }"
      >
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <Icon icon="icon-park-outline:lock" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <div class="form-options">
      <n-checkbox
        v-model:checked="rememberMe"
        class="glass-checkbox"
        :style="{ '--checkbox-color': checkboxColor }"
      >
        记住用户名
      </n-checkbox>
    </div>

    <n-form-item path="captcha">
      <div class="captcha-row">
        <n-input
          v-model:value="formData.captcha"
          placeholder="验证码"
          :maxlength="4"
          class="glass-input captcha-input"
          :input-props="{ autocomplete: 'off' }"
        >
          <template #prefix>
            <n-icon size="18" :color="iconColor">
              <Icon icon="icon-park-outline:check-one" />
            </n-icon>
          </template>
        </n-input>
        <img
          v-if="captchaImage"
          :src="captchaImage"
          alt="验证码"
          class="captcha-image"
          :class="{ 'captcha-image--loading': captchaLoading }"
          title="点击刷新验证码"
          @click="loadCaptcha"
        >
        <n-spin v-else size="small" />
      </div>
    </n-form-item>

    <n-button
      type="primary"
      block
      :loading="loading"
      class="glass-btn text-base"
      @click="handleLogin"
    >
      {{ loading ? "登录中..." : "登 录" }}
    </n-button>

    <div class="form-footer">
      <span class="footer-text text-sm">还没有账号？</span>
      <span class="footer-link text-sm" @click="emit('switchToRegister')">立即注册</span>
    </div>
  </n-form>
</template>

<style lang="scss" scoped>
.glass-form {
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* Input styling */
  .glass-input {
    --n-border: 1px solid rgba(255, 255, 255, 0.15) !important;
    --n-border-focus: 1px solid rgba(255, 255, 255, 0.4) !important;
    --n-border-hover: 1px solid rgba(255, 255, 255, 0.25) !important;
    --n-color: rgba(255, 255, 255, 0.06) !important;
    --n-color-focus: rgba(255, 255, 255, 0.1) !important;
    --n-text-color: #fff !important;
    --n-placeholder-color: rgba(255, 255, 255, 0.35) !important;
    --n-caret-color: #18a058 !important;
    --n-border-radius: 12px !important;
    height: 48px;

    :deep(.n-input-wrapper) {
      padding: 0 16px;
    }

    :deep(.n-input__border),
    :deep(.n-input__state-border) {
      border-radius: 12px !important;
    }

    :deep(.n-input__input) {
      font-size: 15px;
    }
  }

  /* Checkbox */
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 4px 0 16px;
  }

  /* Captcha */
  .captcha-row {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .captcha-input {
    flex: 1;
  }

  .captcha-image {
    height: 48px;
    width: 120px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: #fff;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }

    &--loading {
      opacity: 0.5;
    }
  }

  .glass-checkbox {
    --n-text-color: rgba(255, 255, 255, 0.6) !important;
    --n-size: 16px;
  }

  /* Button */
  .glass-btn {
    height: 48px;
    border-radius: 12px !important;
    font-weight: 600;
    letter-spacing: 2px;
    border: none;
    background: linear-gradient(135deg, #18a058, #0d7a3a) !important;
    box-shadow: 0 4px 16px rgba(24, 160, 88, 0.35);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(24, 160, 88, 0.45);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* Footer */
  .form-footer {
    text-align: center;
    margin-top: 24px;
  }

  .footer-text {
    color: rgba(255, 255, 255, 0.45);
  }

  .footer-link {
    color: #18a058;
    cursor: pointer;
    margin-left: 4px;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #36ad6a;
      text-decoration: underline;
    }
  }
}
</style>
