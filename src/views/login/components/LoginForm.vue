<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    :show-label="false"
    class="glass-form"
    size="large">
    <n-form-item path="username">
      <n-input
        v-model:value="formData.username"
        placeholder="用户名"
        :maxlength="20"
        class="glass-input"
        :input-props="{ autocomplete: 'username' }">
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
        placeholder="密码"
        show-password-on="click"
        class="glass-input"
        :input-props="{ autocomplete: 'current-password' }">
        <template #prefix>
          <n-icon size="18" :color="iconColor">
            <icon icon="icon-park-outline:lock" />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <div class="form-options">
      <n-checkbox
        v-model:checked="rememberMe"
        class="glass-checkbox"
        :style="{ '--checkbox-color': checkboxColor }">
        记住密码
      </n-checkbox>
    </div>

    <n-button
      type="primary"
      block
      :loading="loading"
      class="glass-btn"
      @click="handleLogin">
      {{ loading ? "登录中..." : "登 录" }}
    </n-button>

    <div class="form-footer">
      <span class="footer-text">还没有账号？</span>
      <span class="footer-link" @click="emit('switchToRegister')"
        >立即注册</span
      >
    </div>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { UserApi } from "@/api/user";
import { useAuthStore } from "@/store/modules";
import { Icon } from "@iconify/vue";
import type { FormInst } from "naive-ui";

const emit = defineEmits(["success", "switchToRegister"]);

const authStore = useAuthStore();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const rememberMe = ref(false);

const formData = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 4, message: "密码长度不能小于4位", trigger: "blur" },
  ],
};

const iconColor = computed(() => "rgba(255,255,255,0.5)");
const checkboxColor = computed(() => "rgba(255,255,255,0.7)");

onMounted(() => {
  const saved = localStorage.getItem("REMEMBER_LOGIN");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      formData.username = data.username || "";
      formData.password = data.password || "";
      rememberMe.value = true;
    } catch {
      /* ignore */
    }
  }
});

async function handleLogin() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const result = await UserApi.login({
      username: formData.username,
      password: formData.password,
    });

    authStore.setToken(result);

    if (rememberMe.value) {
      localStorage.setItem("REMEMBER_LOGIN", JSON.stringify(formData));
    } else {
      localStorage.removeItem("REMEMBER_LOGIN");
    }

    emit("success");
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

/* Checkbox */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0 16px;
}

.glass-checkbox {
  --n-text-color: rgba(255, 255, 255, 0.6) !important;
  --n-size: 16px;
}

/* Button */
.glass-btn {
  height: 48px;
  border-radius: 12px !important;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
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

/* Footer */
.form-footer {
  text-align: center;
  margin-top: 24px;
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

