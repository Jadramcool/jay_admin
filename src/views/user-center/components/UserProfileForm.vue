<script setup lang="ts">
import { UserApi } from '@/api/user/user'
import { FormEdit, useForm } from '@/components/Form'
import { basicInfoSchemas, contactSchemas, mapFormToSubmit, mapUserInfoToForm } from '../schema'

const props = defineProps<{
  userData: Api.UserInfo | null
}>()

const emit = defineEmits<{
  saveSuccess: []
}>()

// ---- Form instances ----
const [registerBasic, basicMethods] = useForm({
  schemas: basicInfoSchemas,
  showActionButtonGroup: false,
  labelPlacement: 'left',
  labelWidth: 80,
  gridProps: { cols: '1 s:1 m:1 l:2 xl:2', xGap: 18, yGap: 14 },
})

const [registerContact, contactMethods] = useForm({
  schemas: contactSchemas,
  showActionButtonGroup: false,
  labelPlacement: 'left',
  labelWidth: 80,
  gridProps: { cols: '1 s:1 m:2 l:2 xl:2', xGap: 18, yGap: 14 },
})

// ---- State ----
const saving = shallowRef(false)
const saveSuccess = shallowRef(false)
let initialSnapshot = ''
let loading = false

// ---- Dirty tracking — computed, no timing issues ----
const isDirty = computed(() => {
  if (loading || !initialSnapshot)
    return false
  const current = JSON.stringify({ basic: basicMethods.getFieldsValue(), contact: contactMethods.getFieldsValue() })
  return current !== initialSnapshot
})

function checkUnsaved() {
  return isDirty.value
}

// ---- Data loading ----
function loadFormData(data: Api.UserInfo) {
  loading = true
  const formData = mapUserInfoToForm(data)
  basicMethods.setFieldsValue(formData)
  contactMethods.setFieldsValue(formData)
  nextTick(() => {
    initialSnapshot = JSON.stringify({
      basic: basicMethods.getFieldsValue(),
      contact: contactMethods.getFieldsValue(),
    })
    loading = false
  })
}

watch(
  () => props.userData,
  (data) => {
    if (data?.id) {
      loadFormData(data)
    }
  },
  { immediate: true, deep: true },
)

// ---- Save ----
async function handleSave() {
  saving.value = true
  try {
    const basic = basicMethods.getFieldsValue()
    const contact = contactMethods.getFieldsValue()
    await UserApi.updateUser(mapFormToSubmit({ ...basic, ...contact }))
    const data = await UserApi.getUserInfo()
    loadFormData(data)
    await nextTick()
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
    window.$message?.success?.('个人信息更新成功')
    emit('saveSuccess')
  }
  catch { /* handled by interceptor */ }
  finally {
    saving.value = false
  }
}

defineExpose({ checkUnsaved })
</script>

<template>
  <div class="profile-content">
    <!-- Unsaved hint -->
    <Transition name="uc-fade">
      <div
        v-if="isDirty && !saveSuccess"
        class="profile-hint"
        role="status"
        aria-live="polite"
      >
        <span class="profile-hint__dot" aria-hidden="true" />
        <JIcon icon="icon-park-outline:remind" :size="16" aria-hidden="true" />
        <span>您有未保存的更改，记得点击「保存修改」</span>
      </div>
    </Transition>

    <section class="card card--basic">
      <header class="card__head">
        <span class="card__icon" aria-hidden="true">
          <JIcon icon="icon-park-outline:people" :size="18" />
        </span>
        <div class="card__head-text">
          <h3 class="card__title">
            基本信息
          </h3>
          <p class="card__subtitle">
            完善个人身份资料
          </p>
        </div>
      </header>
      <div class="card__divider" />
      <FormEdit
        @register="registerBasic"
      />
    </section>

    <section class="card card--contact">
      <header class="card__head">
        <span class="card__icon" aria-hidden="true">
          <JIcon icon="icon-park-outline:phone-telephone" :size="18" />
        </span>
        <div class="card__head-text">
          <h3 class="card__title">
            联系方式
          </h3>
          <p class="card__subtitle">
            便于团队与系统通知联系
          </p>
        </div>
      </header>
      <div class="card__divider" />
      <FormEdit
        @register="registerContact"
      />
    </section>

    <!-- Actions -->
    <div class="actions">
      <Transition name="uc-scale" mode="out-in">
        <n-button
          v-if="!saveSuccess"
          key="save"
          type="primary"
          :loading="saving"
          attr-aria-busy="saving"
          class="actions__btn"
          @click="handleSave"
        >
          <JIcon icon="icon-park-outline:check" :size="16" aria-hidden="true" />
          <span>{{ saving ? '保存中…' : '保存修改' }}</span>
        </n-button>
        <n-button
          v-else
          key="done"
          type="success"
          disabled
          class="actions__btn"
        >
          <JIcon icon="icon-park-outline:check-one" :size="16" aria-hidden="true" />
          <span>已保存</span>
        </n-button>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---- Unsaved hint ---- */
.profile-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: calc(var(--border-radius) + 4px);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--primary-color);
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1), rgba(var(--primary-color-rgb), 0.04));
  border: 1px solid rgba(var(--primary-color-rgb), 0.22);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.06);

  svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
}

.profile-hint__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* ---- Glass card ---- */
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

/* ---- Color-distinct tints ---- */
.card--basic {
  background: linear-gradient(135deg, #f5f9fd 0%, #e1efff 100%);
  border-color: rgba(64, 158, 255, 0.28);
  box-shadow:
    0 4px 14px rgba(64, 158, 255, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.02);

  &::before {
    background: linear-gradient(90deg, #409eff, #66b1ff, transparent);
  }

  &:hover {
    box-shadow:
      0 10px 26px rgba(64, 158, 255, 0.14),
      0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .card__icon {
    background: linear-gradient(135deg, #409eff, #2b7fd9);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.36);
  }
}

.card--contact {
  background: linear-gradient(135deg, #f2faf6 0%, #d9f2e6 100%);
  border-color: rgba(35, 178, 130, 0.28);
  box-shadow:
    0 4px 14px rgba(35, 178, 130, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.02);

  &::before {
    background: linear-gradient(90deg, #23b282, #4ed1a0, transparent);
  }

  &:hover {
    box-shadow:
      0 10px 26px rgba(35, 178, 130, 0.14),
      0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .card__icon {
    background: linear-gradient(135deg, #23b282, #1a8e66);
    box-shadow: 0 4px 12px rgba(35, 178, 130, 0.36);
  }
}

html.dark .card--basic {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.18) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-color: rgba(64, 158, 255, 0.32);
}

html.dark .card--contact {
  background: linear-gradient(135deg, rgba(35, 178, 130, 0.18) 0%, rgba(35, 178, 130, 0.08) 100%);
  border-color: rgba(35, 178, 130, 0.32);
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
  text-wrap: balance;
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
  opacity: 0.6;
}

.card--basic .card__divider {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.25), rgba(64, 158, 255, 0.08));
  opacity: 1;
}

.card--contact .card__divider {
  background: linear-gradient(90deg, rgba(35, 178, 130, 0.25), rgba(35, 178, 130, 0.08));
  opacity: 1;
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

.card :deep(.n-base-selection) {
  border-radius: calc(var(--border-radius) + 2px);
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

.uc-scale-enter-active,
.uc-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.uc-scale-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.uc-scale-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

.uc-fade-enter-active,
.uc-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.uc-fade-enter-from,
.uc-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
