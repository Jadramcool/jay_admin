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
  gridProps: { cols: '1 m:2 l:2 xl:2', xGap: 18, yGap: 10 },
})

const [registerContact, contactMethods] = useForm({
  schemas: contactSchemas,
  showActionButtonGroup: false,
  labelPlacement: 'left',
  labelWidth: 80,
  gridProps: { cols: '1 m:2 l:2 xl:2', xGap: 18, yGap: 10 },
})

// ---- State ----
const saving = shallowRef(false)
const loading = shallowRef(false)
/** 最近一次已保存（或已加载）的表单数据，用于「重置」 */
const lastLoaded = shallowRef<ReturnType<typeof mapUserInfoToForm> | null>(null)
let baseline = ''

function snapshot() {
  return JSON.stringify({
    basic: basicMethods.getFieldsValue(),
    contact: contactMethods.getFieldsValue(),
  })
}

/** 脏数据检测 — JSON 快照比较，纯派生、无时序问题 */
const isDirty = computed(() => !loading.value && !!baseline && snapshot() !== baseline)

const actionsDisabled = computed(() => !isDirty.value || saving.value)

function checkUnsaved() {
  return isDirty.value
}

// ---- 数据加载 / 重置共用同一套回填逻辑 ----
async function applyFormData(data: ReturnType<typeof mapUserInfoToForm>) {
  loading.value = true
  try {
    await basicMethods.setFieldsValue(data)
    await contactMethods.setFieldsValue(data)
    await basicMethods.clearValidate()
    await contactMethods.clearValidate()
    await nextTick()
    baseline = snapshot()
  }
  finally {
    loading.value = false
  }
}

async function loadFormData(data: Api.UserInfo) {
  const formData = mapUserInfoToForm(data)
  lastLoaded.value = formData
  await applyFormData(formData)
}

// 首次加载：父组件 onMounted 晚于子组件 FormEdit 注册，表单实例此时已就绪。
// 不能用 watch immediate —— setup 同步阶段注册尚未完成，setFieldsValue 会拿到 null。
onMounted(() => {
  if (props.userData?.id)
    loadFormData(props.userData)
})

// 后续数据刷新（父级保存成功后更新 userInfo）
watch(
  () => props.userData,
  (data) => {
    if (data?.id)
      loadFormData(data)
  },
  { deep: true },
)

// ---- 操作 ----
function handleReset() {
  if (lastLoaded.value)
    applyFormData(lastLoaded.value)
}

async function handleSave() {
  try {
    await basicMethods.validate()
    await contactMethods.validate()
  }
  catch {
    window.$message?.warning?.('请检查表单填写内容')
    return
  }

  saving.value = true
  try {
    const basic = basicMethods.getFieldsValue()
    const contact = contactMethods.getFieldsValue()
    await UserApi.updateUser(mapFormToSubmit({ ...basic, ...contact }))
    const data = await UserApi.getUserInfo()
    await loadFormData(data)
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
    <!-- 未保存提示 -->
    <Transition name="uc-fade">
      <div
        v-if="isDirty"
        class="profile-hint"
        role="status"
        aria-live="polite"
      >
        <span class="profile-hint__dot" aria-hidden="true" />
        <span>您有未保存的更改</span>
        <button
          type="button"
          class="profile-hint__action"
          @click="handleReset"
        >
          放弃更改
        </button>
      </div>
    </Transition>

    <!-- 基本信息 -->
    <section class="card">
      <header class="card__head">
        <h3 class="card__title">
          基本信息
        </h3>
        <p class="card__subtitle">
          完善个人身份资料
        </p>
      </header>
      <FormEdit @register="registerBasic" />
    </section>

    <!-- 联系方式 -->
    <section class="card">
      <header class="card__head">
        <h3 class="card__title">
          联系方式
        </h3>
        <p class="card__subtitle">
          便于团队与系统通知联系
        </p>
      </header>
      <FormEdit @register="registerContact" />
    </section>

    <!-- 操作区 -->
    <footer class="actions">
      <n-button
        class="actions__btn"
        :disabled="actionsDisabled"
        @click="handleReset"
      >
        重置
      </n-button>
      <n-button
        type="primary"
        class="actions__btn actions__btn--primary"
        :loading="saving"
        :disabled="!isDirty"
        attr-aria-busy="saving"
        @click="handleSave"
      >
        {{ saving ? '保存中…' : '保存修改' }}
      </n-button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---- 未保存提示 ---- */
.profile-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
}

.profile-hint__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary-color);
  flex-shrink: 0;
}

.profile-hint__action {
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  color: var(--card-sub-text);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: var(--primary-color);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

/* ---- 卡片：与系统扁平风格一致 ---- */
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

/* ---- 操作区 ---- */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.actions__btn {
  min-width: 104px !important;
  border-radius: var(--radius-sm) !important;

  &--primary {
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
  }

  :deep(.n-button__content) {
    font-weight: 600;
  }
}

@media (max-width: 860px) {
  .card {
    padding: 14px 16px;
  }

  .actions {
    flex-direction: column-reverse;

    .actions__btn {
      width: 100%;
    }
  }
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
