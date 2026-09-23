<script setup lang="ts">
import type { FormSchema } from '@/components/Form/src/types'
import { UserApi } from '@/api/user/user'
import { FormEdit, useForm } from '@/components/Form'

// ---- 密码字段 schemas ----
/** 表单值访问器：与 useForm 初始化顺序解耦，供 schema 中的 validator 使用 */
const formValueGetter = shallowRef<() => Recordable>(() => ({}))

const passwordSchemas: FormSchema[] = [
  {
    field: 'oldPassword',
    label: '当前密码',
    giProps: { span: 2 },
    component: 'NInput',
    defaultValue: '',
    rules: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    componentProps: {
      type: 'password',
      showPasswordOn: 'click',
      placeholder: '输入当前密码…',
      onBlur: () => handleOldPasswordBlur(),
    },
  },
  {
    field: 'newPassword',
    label: '新密码',
    component: 'NInput',
    defaultValue: '',
    rules: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    ],
    componentProps: {
      type: 'password',
      showPasswordOn: 'click',
      placeholder: '至少 6 个字符…',
    },
  },
  {
    field: 'confirmPassword',
    label: '确认新密码',
    component: 'NInput',
    defaultValue: '',
    rules: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
          if (!value || value === formValueGetter.value().newPassword)
            callback()
          else
            callback(new Error('两次输入的密码不一致'))
        },
        trigger: 'blur',
      },
    ],
    componentProps: {
      type: 'password',
      showPasswordOn: 'click',
      placeholder: '再次输入新密码…',
    },
  },
]

// ---- Form instance ----
const [registerForm, { getFieldsValue, validate, resetFields, clearValidate }] = useForm({
  schemas: passwordSchemas,
  showActionButtonGroup: false,
  labelPlacement: 'left',
  labelWidth: 80,
  gridProps: { cols: '1 m:2 l:2 xl:2', xGap: 18, yGap: 10 },
})

formValueGetter.value = getFieldsValue

// ---- 表单值（驱动强度条与规则清单） ----
const formValues = computed(() => getFieldsValue())

// ---- 密码强度 ----
const lengthOk = computed(() => (formValues.value?.newPassword?.length ?? 0) >= 6)
const mixedOk = computed(() => {
  const pwd = formValues.value?.newPassword || ''
  const varieties = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^a-z0-9]/i.test(pwd),
  ].filter(Boolean).length
  return varieties >= 2
})

const passwordStrength = computed<{ score: number, label: string }>(() => {
  const pwd = formValues.value?.newPassword || ''
  if (!pwd)
    return { score: 0, label: '未输入' }
  let score = 0
  if (lengthOk.value)
    score += 1
  if (pwd.length >= 10)
    score += 1
  if (mixedOk.value)
    score += 1
  const label = score <= 1 ? '弱' : score === 2 ? '中' : '强'
  return { score: Math.min(score, 3), label }
})

const strengthSegments = computed(() => {
  const score = passwordStrength.value.score
  return [
    { key: 1, active: score >= 1, level: 'weak' },
    { key: 2, active: score >= 2, level: 'medium' },
    { key: 3, active: score >= 3, level: 'strong' },
  ]
})

// ---- 当前密码即时验证 ----
const oldPasswordChecking = shallowRef(false)
const oldPasswordVerified = shallowRef<boolean | null>(null)

watch(() => formValues.value?.oldPassword, () => {
  oldPasswordVerified.value = null
})

async function verifyOldPassword(pwd: string) {
  if (!pwd)
    return false
  oldPasswordChecking.value = true
  try {
    await UserApi.checkPassword(pwd)
    oldPasswordVerified.value = true
    return true
  }
  catch {
    oldPasswordVerified.value = false
    return false
  }
  finally {
    oldPasswordChecking.value = false
  }
}

function handleOldPasswordBlur() {
  verifyOldPassword(formValues.value?.oldPassword || '')
}

// 新密码变更后清除校验残留（如确认密码不一致的旧提示）
watch(() => formValues.value?.newPassword, () => {
  clearValidate()
})

// ---- 提交 ----
const passwordLoading = shallowRef(false)

async function handleSubmit() {
  try {
    await validate()
  }
  catch { return }

  const values = getFieldsValue()
  // 表单校验通过后，确保当前密码确实验证通过（兼容未触发失焦校验的场景）
  if (oldPasswordVerified.value !== true && !(await verifyOldPassword(values.oldPassword))) {
    window.$message?.error?.('当前密码验证失败，请检查输入')
    return
  }

  passwordLoading.value = true
  try {
    await UserApi.updatePassword({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    })
    window.$message?.success?.('密码修改成功')
    resetFields()
    oldPasswordVerified.value = null
  }
  catch { /* handled by interceptor */ }
  finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="password-content">
    <section class="card">
      <header class="card__head">
        <h3 class="card__title">
          修改密码
        </h3>
        <p class="card__subtitle">
          定期更换密码以保障账户安全
        </p>
      </header>

      <FormEdit @register="registerForm" />

      <!-- 当前密码验证反馈 -->
      <div
        v-if="oldPasswordChecking"
        class="feedback"
        role="status"
        aria-live="polite"
      >
        <span class="feedback__spinner" aria-hidden="true" />
        <span>正在验证当前密码…</span>
      </div>
      <div
        v-else-if="oldPasswordVerified === false"
        class="feedback feedback--error"
        role="alert"
        aria-live="assertive"
      >
        <JIcon icon="icon-park-outline:attention" :size="15" aria-hidden="true" />
        <span>当前密码验证失败，请核对后重试</span>
      </div>
      <div
        v-else-if="oldPasswordVerified === true"
        class="feedback feedback--ok"
        role="status"
        aria-live="polite"
      >
        <JIcon icon="icon-park-outline:check-one" :size="15" aria-hidden="true" />
        <span>当前密码验证通过</span>
      </div>

      <!-- 强度条 -->
      <div v-if="formValues?.newPassword" class="strength" :aria-label="`密码强度：${passwordStrength.label}`">
        <div class="strength__bars" aria-hidden="true">
          <span
            v-for="seg in strengthSegments"
            :key="seg.key"
            class="strength__bar"
            :class="[`strength__bar--${seg.level}`, { 'strength__bar--active': seg.active }]"
          />
        </div>
        <span class="strength__label" :class="`strength__label--${passwordStrength.score}`">
          {{ passwordStrength.label }}
        </span>
      </div>

      <!-- 规则清单 -->
      <ul class="rules" aria-label="密码规则">
        <li class="rules__item" :class="{ 'rules__item--ok': lengthOk }">
          <span class="rules__check" aria-hidden="true">
            <JIcon :icon="lengthOk ? 'icon-park-outline:check-one' : 'icon-park-outline:remind'" :size="14" />
          </span>
          <span>长度至少 6 个字符</span>
        </li>
        <li class="rules__item" :class="{ 'rules__item--ok': mixedOk }">
          <span class="rules__check" aria-hidden="true">
            <JIcon :icon="mixedOk ? 'icon-park-outline:check-one' : 'icon-park-outline:remind'" :size="14" />
          </span>
          <span>包含字母、数字、符号中的至少 2 种</span>
        </li>
      </ul>
    </section>

    <!-- 安全建议 -->
    <section class="tips">
      <h4 class="tips__title">
        安全建议
      </h4>
      <ul class="tips__list">
        <li>避免使用生日、手机号、连续数字等易被猜测的密码</li>
        <li>不建议在多个网站使用相同的密码</li>
        <li>建议混合使用大小写字母、数字与特殊符号</li>
        <li>定期更换密码，确保账户持续安全</li>
      </ul>
    </section>

    <footer class="actions">
      <n-button
        type="primary"
        class="actions__btn"
        :loading="passwordLoading"
        attr-aria-busy="passwordLoading"
        @click="handleSubmit"
      >
        {{ passwordLoading ? '更新中…' : '更新密码' }}
      </n-button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.password-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---- 卡片 ---- */
.card {
  padding: 18px 20px;
  border: 1px solid var(--layout-border-light);
  border-radius: var(--radius-md);
  background: var(--card-bg);
}

.card__head {
  margin-bottom: 14px;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--card-header-text);
}

.card__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--card-sub-text);
}

.card :deep(.n-form-item-label) {
  font-size: 13px;
  color: var(--card-header-text);
}

.card :deep(.n-form-item) {
  margin-bottom: 0;
}

.card :deep(.n-form-item-feedback) {
  font-size: 12px;
}

/* ---- 当前密码验证反馈 ---- */
.feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;

  &--error {
    color: #d03050;
    background: rgba(208, 48, 80, 0.08);
    border: 1px solid rgba(208, 48, 80, 0.18);
  }

  &--ok {
    color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.08);
    border: 1px solid rgba(var(--primary-color-rgb), 0.18);
  }
}

.feedback__spinner {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid rgba(var(--primary-color-rgb), 0.25);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: feedback-spin 0.8s linear infinite;
}

@keyframes feedback-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---- 强度条 ---- */
.strength {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 520px;
  margin-top: 12px;
}

.strength__bars {
  display: flex;
  gap: 5px;
  flex: 1;
}

.strength__bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: var(--card-divider);
  transition: background-color 0.25s ease;

  &--weak.strength__bar--active {
    background: #d03050;
  }

  &--medium.strength__bar--active {
    background: #f0a020;
  }

  &--strong.strength__bar--active {
    background: var(--primary-color);
  }
}

.strength__label {
  min-width: 28px;
  font-size: 11.5px;
  font-weight: 600;
  text-align: right;
  color: var(--card-sub-text);

  &--1 {
    color: #d03050;
  }

  &--2 {
    color: #f0a020;
  }

  &--3 {
    color: var(--primary-color);
  }
}

/* ---- 规则清单 ---- */
.rules {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.rules__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--card-sub-text);
  transition: color 0.2s ease;

  &--ok {
    color: var(--card-header-text);

    .rules__check {
      color: var(--primary-color);
      background: rgba(var(--primary-color-rgb), 0.1);
    }
  }
}

.rules__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--card-sub-text);
  background: var(--layout-bg-hover);
  flex-shrink: 0;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

/* ---- 安全建议 ---- */
.tips {
  padding: 14px 16px;
  border: 1px solid var(--layout-border-light);
  border-radius: var(--radius-md);
  background: var(--layout-bg-secondary);
}

.tips__title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--card-header-text);
}

.tips__list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding-left: 16px;

  li {
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--card-sub-text);
  }
}

/* ---- 操作区 ---- */
.actions {
  display: flex;
  justify-content: flex-end;
}

.actions__btn {
  min-width: 124px !important;
  border-radius: var(--radius-sm) !important;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);

  :deep(.n-button__content) {
    font-weight: 600;
  }
}

@media (max-width: 860px) {
  .card {
    padding: 14px 16px;
  }

  .actions {
    justify-content: stretch;

    .actions__btn {
      width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .feedback__spinner {
    animation: none;
  }
}
</style>
