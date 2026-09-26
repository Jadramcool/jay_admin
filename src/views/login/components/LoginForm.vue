<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { UserApi } from '@/api/user'
import { DEFAULT_PLATFORM } from '@/constants'
import { useAuthStore } from '@/store/modules'

const emit = defineEmits(['success', 'switchToRegister'])

const authStore = useAuthStore()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')
const captchaLoading = ref(false)
/** 验证码是否启用(由后端 /auth/captcha 返回,本地环境可关闭) */
const captchaEnabled = ref(false)

// ===== 登录加载覆盖层 =====
// 覆盖「点击登录 → 守卫拉取用户信息/动态路由 → 进入工作台」的整段静默期
const overlayLoading = ref(false)

/** 登录成功但导航被守卫拦截(权限失效/重复导航)时,由父组件调用复位 */
function stopLoading() {
  overlayLoading.value = false
}

defineExpose({ stopLoading })

const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaId: '',
})

const rules = computed(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不能小于4位', trigger: 'blur' },
  ],
  captcha: captchaEnabled.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : [],
}))

const iconColor = computed(() => 'rgba(255,255,255,0.5)')
const checkboxColor = computed(() => 'rgba(255,255,255,0.7)')

/** 加载验证码图片(后端关闭时不展示) */
async function loadCaptcha() {
  captchaLoading.value = true
  try {
    const result = await UserApi.getCaptcha()
    captchaEnabled.value = result.enabled
    if (result.enabled && result.captchaId) {
      formData.captchaId = result.captchaId
      formData.captcha = ''
      captchaImage.value = result.image ?? ''
    }
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
  overlayLoading.value = true
  try {
    // 管理端登录显式声明端：服务端只下发该端的角色与权限
    const payload: Api.LoginParams & { platform?: string } = {
      username: formData.username,
      password: formData.password,
      platform: DEFAULT_PLATFORM,
      // 验证码关闭时不携带验证码参数
      ...(captchaEnabled.value
        ? { captcha: formData.captcha, captchaId: formData.captchaId }
        : {}),
    }
    const result = await UserApi.login(payload)

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
    overlayLoading.value = false
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

    <n-form-item v-if="captchaEnabled" path="captcha">
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

  <!-- 登录加载覆盖层(挂到 body,避免卡片 transform 影响 fixed 定位) -->
  <Teleport to="body">
    <Transition name="login-fade">
      <div v-if="overlayLoading" class="login-overlay">
        <n-spin size="large" />
        <p class="overlay-text text-sm">
          正在进入系统…
        </p>
      </div>
    </Transition>
  </Teleport>
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

/* ===== 登录加载覆盖层 ===== */
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(7, 11, 22, 0.62);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.overlay-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
}

.login-fade-enter-active,
.login-fade-leave-active {
  transition: opacity 0.3s ease;
}

.login-fade-enter-from,
.login-fade-leave-to {
  opacity: 0;
}
</style>
