<script setup lang="ts">
import type { FormSchema } from '@/components/Form/src/types'
import { UserApi } from '@/api/user/user'
import { FormEdit, useForm } from '@/components/Form'

// ---- Password field schemas ----
const passwordSchemas: FormSchema[] = [
  {
    field: 'oldPassword',
    label: '当前密码',
    giProps: { span: 2 },
    component: 'NInput',
    defaultValue: '',
    rules: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
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
      { required: true, message: '请确认密码', trigger: 'blur' },
    ],
    componentProps: {
      type: 'password',
      showPasswordOn: 'click',
      placeholder: '再次输入新密码…',
    },
  },
]

// ---- Form instance ----
const [registerForm, { getFieldsValue, validate, resetFields }] = useForm({
  schemas: passwordSchemas,
  showActionButtonGroup: false,
  labelPlacement: 'left',
  labelWidth: 90,
  gridProps: { cols: '1 s:1 m:2 l:2 xl:2', xGap: 18, yGap: 14 },
})

// ---- Reactively track form values ----
const formValues = computed(() => getFieldsValue())

// ---- Password strength & checks ----
interface PasswordChecks { length: boolean, mixed: boolean }
interface PasswordStrength { score: number, label: string }

const passwordChecks = computed<PasswordChecks>(() => {
  const pwd = formValues.value?.newPassword || ''
  const length = pwd.length >= 6
  const varieties = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^a-z0-9]/i.test(pwd),
  ].filter(Boolean).length
  return { length, mixed: varieties >= 2 }
})

const passwordStrength = computed<PasswordStrength>(() => {
  const pwd = formValues.value?.newPassword || ''
  if (!pwd)
    return { score: 0, label: '未输入' }
  const { length, mixed } = passwordChecks.value
  let score = 0
  if (length)
    score += 1
  if (pwd.length >= 10)
    score += 1
  if (mixed)
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

// ---- Old password verification ----
const oldPasswordChecking = shallowRef(false)
const oldPasswordVerified = shallowRef<boolean | null>(null)

watch(() => formValues.value?.oldPassword, () => {
  oldPasswordVerified.value = null
})

async function handleOldPasswordBlur() {
  const oldPwd = formValues.value?.oldPassword
  if (!oldPwd)
    return
  oldPasswordChecking.value = true
  try {
    await UserApi.checkPassword(oldPwd)
    oldPasswordVerified.value = true
  }
  catch {
    oldPasswordVerified.value = false
  }
  finally {
    oldPasswordChecking.value = false
  }
}

// ---- Submit ----
const passwordLoading = shallowRef(false)

async function handleSubmit() {
  try {
    await validate()
  }
  catch { return }

  const values = getFieldsValue()
  if (values.newPassword !== values.confirmPassword) {
    window.$message?.error?.('两次密码不一致')
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
    <section class="card card--password">
      <header class="card__head">
        <span class="card__icon" aria-hidden="true">
          <JIcon icon="icon-park-outline:lock" :size="18" />
        </span>
        <div class="card__head-text">
          <h3 class="card__title">
            修改密码
          </h3>
          <p class="card__subtitle">
            定期更换密码以保障账户安全
          </p>
        </div>
      </header>
      <div class="card__divider" />

      <FormEdit @register="registerForm" />

      <!-- Old password verification feedback -->
      <div
        v-if="oldPasswordVerified === false"
        class="feedback feedback--error"
        role="alert"
        aria-live="assertive"
      >
        <JIcon icon="icon-park-outline:attention" :size="15" aria-hidden="true" />
        <span>当前密码验证失败，请重新输入</span>
      </div>
      <div
        v-else-if="oldPasswordVerified === true"
        class="feedback feedback--ok"
        role="status"
        aria-live="polite"
      >
        <JIcon icon="icon-park-outline:check-one" :size="15" aria-hidden="true" />
        <span>密码验证通过</span>
      </div>

      <!-- Strength meter -->
      <div v-if="formValues?.newPassword" class="strength" :aria-label="`密码强度：${passwordStrength.label}`">
        <div class="strength__bars">
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

      <!-- Rule checklist -->
      <ul class="rules" aria-label="密码规则">
        <li class="rules__item" :class="{ 'rules__item--ok': passwordChecks.length }">
          <span class="rules__check" aria-hidden="true">
            <JIcon :icon="passwordChecks.length ? 'icon-park-outline:check-one' : 'icon-park-outline:remind'" :size="15" />
          </span>
          <span>长度至少 6 个字符</span>
        </li>
        <li class="rules__item" :class="{ 'rules__item--ok': passwordChecks.mixed }">
          <span class="rules__check" aria-hidden="true">
            <JIcon :icon="passwordChecks.mixed ? 'icon-park-outline:check-one' : 'icon-park-outline:remind'" :size="15" />
          </span>
          <span>包含字母、数字、符号中的至少 2 种</span>
        </li>
      </ul>
    </section>

    <!-- Security tips -->
    <section class="tips">
      <header class="tips__head">
        <span class="tips__icon" aria-hidden="true">
          <JIcon icon="icon-park-outline:shield" :size="18" />
        </span>
        <h3 class="tips__title">
          安全建议
        </h3>
      </header>
      <ul class="tips__list">
        <li>避免使用生日、手机号、连续数字等易被猜测的密码</li>
        <li>不要在多个网站使用相同密码</li>
        <li>建议混合使用大小写字母、数字与特殊符号</li>
        <li>定期更换密码，确保账户持续安全</li>
      </ul>
    </section>

    <div class="actions">
      <n-button
        type="primary"
        :loading="passwordLoading"
        attr-aria-busy="passwordLoading"
        class="actions__btn"
        @click="handleSubmit"
      >
        <JIcon icon="icon-park-outline:lock" :size="16" aria-hidden="true" />
        <span>{{ passwordLoading ? '更新中…' : '更新密码' }}</span>
      </n-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.password-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---- Card ---- */
.card {
  position: relative;
  background: var(--card-color);
  border-radius: calc(var(--border-radius) + 8px);
  border: 1px solid var(--border-color);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.02);
  padding: 18px 22px;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-color-hover), transparent);
    opacity: 0.6;
    transition: opacity 0.25s ease;
  }

  &:hover {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.05),
      0 2px 6px rgba(0, 0, 0, 0.02);
    transform: translateY(-1px);
    &::before {
      opacity: 1;
    }
  }
}

/* ---- Password card: warm amber tint to convey caution ---- */
.card--password {
  background: linear-gradient(135deg, #f5f3f1 0%, #faecd0 100%);
  border-color: rgba(240, 160, 32, 0.32);
  box-shadow:
    0 4px 14px rgba(240, 160, 32, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.02);

  &::before {
    background: linear-gradient(90deg, #f0a020, #ffba50, transparent);
  }

  &:hover {
    box-shadow:
      0 10px 26px rgba(240, 160, 32, 0.18),
      0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .card__icon {
    background: linear-gradient(135deg, #f0a020, #c87f0a);
    box-shadow: 0 4px 12px rgba(240, 160, 32, 0.4);
  }
}

html.dark .card--password {
  background: linear-gradient(135deg, rgba(240, 160, 32, 0.18) 0%, rgba(240, 160, 32, 0.08) 100%);
  border-color: rgba(240, 160, 32, 0.36);
}

.card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: calc(var(--border-radius) + 2px);
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.25);
  svg {
    width: 15px;
    height: 15px;
  }
}

.card__head-text {
  min-width: 0;
}

.card__title {
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color-1);
}

.card__subtitle {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: var(--text-color-3);
  line-height: 1.4;
}

.card__divider {
  height: 1px;
  margin: 12px 0 14px;
  background: var(--divider-color);
}

/* ---- Form override ---- */
.card :deep(.n-form-item-label) {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-color-2);
  padding-right: 10px !important;
  text-align: right;
}

.card :deep(.n-form-item) {
  margin-bottom: 0 !important;
}

.card :deep(.n-input) {
  border-radius: calc(var(--border-radius) + 2px);
}

/* ---- Feedback ---- */
.feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 8px 12px;
  border-radius: calc(var(--border-radius) + 4px);
  font-size: 12.5px;
  font-weight: 500;
  animation: feedback-in 0.25s ease;

  &--error {
    background: rgba(208, 48, 80, 0.08);
    color: #d03050;
    border: 1px solid rgba(208, 48, 80, 0.15);
  }

  &--ok {
    background: rgba(var(--primary-color-rgb), 0.08);
    color: var(--primary-color);
    border: 1px solid rgba(var(--primary-color-rgb), 0.15);
  }
}

@keyframes feedback-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* ---- Strength meter ---- */
.strength {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 520px;
  margin-top: 8px;
}

.strength__bars {
  display: flex;
  gap: 5px;
  flex: 1;
}

.strength__bar {
  height: 5px;
  flex: 1;
  border-radius: 3px;
  background: var(--divider-color);
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;

  &--weak.strength__bar--active {
    background: #d03050;
    transform: scaleY(1.15);
  }
  &--medium.strength__bar--active {
    background: #f0a020;
    transform: scaleY(1.15);
  }
  &--strong.strength__bar--active {
    background: var(--primary-color);
    transform: scaleY(1.15);
  }
}

.strength__label {
  font-size: 11.5px;
  font-weight: 700;
  min-width: 28px;
  text-align: right;
  color: var(--text-color-3);
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

/* ---- Checklist ---- */
.rules {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
}

.rules__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-color-3);
  transition: color 0.25s ease;

  &--ok {
    color: var(--text-color-2);
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--text-color-3);
  background: var(--hover-color);
  transition:
    color 0.25s ease,
    background 0.25s ease;
}

/* ---- Tips ---- */
.tips {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.08), rgba(var(--primary-color-rgb), 0.02));
  border: 1px solid rgba(var(--primary-color-rgb), 0.18);
  border-radius: calc(var(--border-radius) + 8px);
  padding: 14px 18px;
}

.tips__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tips__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--border-radius) + 2px);
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.tips__title {
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color-1);
}

.tips__list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  li {
    font-size: 12.5px;
    color: var(--text-color-2);
    line-height: 1.55;
  }
}

/* ---- Actions ---- */
.actions {
  display: flex;
  justify-content: flex-start;
  padding-top: 2px;

  &__btn {
    min-width: 124px;
    height: 36px;
    border-radius: calc(var(--border-radius) + 4px) !important;
    box-shadow: 0 4px 14px rgba(var(--primary-color-rgb), 0.28);

    :deep(.n-button__content) {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
  }
}

@media (max-width: 860px) {
  .card {
    padding: 14px 16px;
    border-radius: calc(var(--border-radius) + 6px);
  }
  .actions {
    justify-content: stretch;
    &__btn {
      width: 100%;
    }
  }
}
</style>
