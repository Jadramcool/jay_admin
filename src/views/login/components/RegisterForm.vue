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
        placeholder="用户名（4-20位字母或数字）"
        :maxlength="20"
        class="glass-input"
      >
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <icon icon="icon-park-outline:user" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="password">
      <n-input
        v-model:value="formData.password"
        type="password"
        placeholder="密码（8-32位）"
        show-password-on="click"
        class="glass-input"
      >
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <icon icon="icon-park-outline:lock" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="confirmPassword">
      <n-input
        v-model:value="formData.confirmPassword"
        type="password"
        placeholder="确认密码"
        show-password-on="click"
        class="glass-input"
      >
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <icon icon="icon-park-outline:lock" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-button
      type="primary"
      block
      :loading="loading"
      class="glass-btn"
      @click="handleRegister"
    >
      {{ loading ? '注册中...' : '注 册' }}
    </n-button>

    <div class="form-footer">
      <span class="footer-text">已有账号？</span>
      <span class="footer-link" @click="emit('switchToLogin')">返回登录</span>
    </div>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { UserApi } from '@/api/user';
import { Icon } from '@iconify/vue';
import type { FormInst } from 'naive-ui';

const emit = defineEmits(['success', 'switchToLogin']);

const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度为4-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度为8-32位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => value === formData.password,
      message: '两次输入的密码不一致',
      trigger: 'blur',
    },
  ],
};

const iconColor = computed(() => 'rgba(255,255,255,0.5)');

async function handleRegister() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    await UserApi.register({
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    emit('success');
  } catch {
    // 错误已由全局 errorHandler 统一弹 toast
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.glass-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

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
}

.glass-input :deep(.n-input-wrapper) {
  padding: 0 16px;
}

.glass-input :deep(.n-input__border),
.glass-input :deep(.n-input__state-border) {
  border-radius: 12px !important;
}

.glass-input :deep(.n-input__input) {
  font-size: 15px;
}

.glass-btn {
  height: 48px;
  border-radius: 12px !important;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-top: 8px;
  border: none;
  background: linear-gradient(135deg, #18a058, #0d7a3a) !important;
  box-shadow: 0 4px 16px rgba(24, 160, 88, 0.35);
  transition: all 0.3s ease;
}

.glass-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(24, 160, 88, 0.45);
}

.glass-btn:active {
  transform: translateY(0);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.footer-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.footer-link {
  font-size: 14px;
  color: #18a058;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 500;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #36ad6a;
  text-decoration: underline;
}
</style>
