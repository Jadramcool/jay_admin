<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { UserApi } from '@/api/user'
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

// ===== 登录渐进加载覆盖层 =====
// 覆盖「点击登录 → 守卫拉取用户信息/动态路由 → 进入工作台」的整段静默期
const LOGIN_STAGES = [
  { index: 1, label: '验证账号信息', target: 40 },
  { index: 2, label: '加载用户与权限', target: 78 },
  { index: 3, label: '进入工作台', target: 96 },
] as const

const loginStage = ref(0)
const loginProgress = ref(0)
let progressTimer: ReturnType<typeof setInterval> | null = null
let stageTimer: ReturnType<typeof setTimeout> | null = null

function stepIcon(index: number) {
  if (index < loginStage.value)
    return 'icon-park-outline:check-one'
  if (index === loginStage.value)
    return 'icon-park-outline:loading'
  return 'icon-park-outline:circle'
}

function startLoginProgress() {
  stopLoginProgress()
  progressTimer = setInterval(() => {
    // 进度向当前阶段目标缓动逼近,阶段推进时目标抬升、速度随之加快
    const current = LOGIN_STAGES.find(s => s.index === loginStage.value)
    const target = current ? current.target : 96
    if (loginProgress.value < target) {
      const delta = Math.max((target - loginProgress.value) * 0.06, 0.1)
      loginProgress.value = Math.min(loginProgress.value + delta, target)
    }
  }, 50)
}

function stopLoginProgress() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (stageTimer) {
    clearTimeout(stageTimer)
    stageTimer = null
  }
}

/** 登录成功但导航被守卫拦截(权限失效/重复导航)时,由父组件调用复位覆盖层 */
function resetLoginOverlay() {
  stopLoginProgress()
  loginStage.value = 0
  loginProgress.value = 0
}

defineExpose({ resetLoginOverlay })

onBeforeUnmount(stopLoginProgress)

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
  loginStage.value = 1
  startLoginProgress()
  try {
    const result = await UserApi.login({
      username: formData.username,
      password: formData.password,
      // 验证码关闭时不携带验证码参数
      ...(captchaEnabled.value
        ? { captcha: formData.captcha, captchaId: formData.captchaId }
        : {}),
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

    loginStage.value = 2
    emit('success')
    // 接下来守卫会拉取用户信息/菜单并注册动态路由;若停留较久则提示"进入工作台"
    stageTimer = setTimeout(() => {
      if (loginStage.value === 2)
        loginStage.value = 3
    }, 900)
  }
  catch {
    // 错误已由全局 errorHandler 统一弹 toast;验证码可能已失效,刷新一张
    resetLoginOverlay()
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

  <!-- 登录渐进加载覆盖层(挂到 body,避免卡片 transform 影响 fixed 定位) -->
  <Teleport to="body">
    <Transition name="login-fade">
      <div v-if="loginStage > 0" class="login-overlay">
        <div class="login-overlay-panel">
          <div class="overlay-logo">
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
              <rect
                width="32"
                height="32"
                rx="8"
                fill="rgba(var(--primary-color-rgb), 0.9)"
              />
              <text
                x="16"
                y="22"
                font-size="18"
                font-weight="bold"
                fill="white"
                text-anchor="middle"
              >
                J
              </text>
            </svg>
          </div>

          <div class="overlay-progress">
            <div
              class="overlay-progress-bar"
              :style="{ width: `${loginProgress}%` }"
            />
          </div>

          <div class="overlay-steps">
            <div
              v-for="step in LOGIN_STAGES"
              :key="step.index"
              class="overlay-step"
              :class="{
                'is-active': step.index === loginStage,
                'is-done': step.index < loginStage,
              }"
            >
              <span class="step-icon">
                <n-icon size="16">
                  <Icon :icon="stepIcon(step.index)" />
                </n-icon>
              </span>
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>
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

/* ===== 登录渐进加载覆盖层 ===== */
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(7, 11, 22, 0.62);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.login-overlay-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay-logo {
  display: inline-flex;
  margin-bottom: 28px;
  filter: drop-shadow(0 0 16px rgba(var(--primary-color-rgb), 0.45));
  animation: logo-pulse 1.6s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

.overlay-progress {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.overlay-progress-bar {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary-color, #18a058), rgba(var(--primary-color-rgb), 0.55));
  transition: width 0.25s ease-out;

  /* 流光扫过,进度停靠时仍保持"活着"的感觉 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    animation: bar-sheen 1.4s linear infinite;
  }
}

@keyframes bar-sheen {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

.overlay-steps {
  margin-top: 24px;
  display: grid;
  gap: 12px;
  align-self: flex-start;
}

.overlay-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.3s;

  .step-icon {
    display: inline-flex;
  }

  &.is-active {
    color: #fff;

    .step-icon {
      color: var(--primary-color, #18a058);

      svg {
        animation: icon-spin 0.9s linear infinite;
      }
    }
  }

  &.is-done {
    color: rgba(255, 255, 255, 0.7);

    .step-icon {
      color: #36ad6a;
    }
  }
}

@keyframes icon-spin {
  to {
    transform: rotate(360deg);
  }
}

.login-fade-enter-active,
.login-fade-leave-active {
  transition: opacity 0.3s ease;
}

.login-fade-enter-from,
.login-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .overlay-logo,
  .overlay-progress-bar::after,
  .overlay-step.is-active .step-icon svg {
    animation: none;
  }
}
</style>
