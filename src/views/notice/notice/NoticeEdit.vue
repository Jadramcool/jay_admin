<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NoticeApi } from '@/api/notice'
import { DepartmentApi, RoleApi, UserManagerApi } from '@/api/system'
import { useForm } from '@/components/Form'
import { useModal } from '@/components/Modal'
import WangEditor from '@/components/WangEditor/index.vue'
import { scopeTypeOptions } from '@/constants'
import ScopeTargetModal from './components/ScopeTargetModal.vue'
import { useNoticeSchema } from './schema.tsx'

const route = useRoute()
const router = useRouter()
const rawId = route.params.id as string | undefined
const parsedId = rawId ? Number(rawId) : Number.NaN
const isValidId = !Number.isNaN(parsedId)
const isUpdate = ref(isValidId)
const loading = ref(false)

// 无效 ID 时跳回列表
if (rawId && !isValidId) {
  window.$message?.warning?.('无效的公告 ID')
  router.replace('/notice/notice')
}

const { editFormSchemas } = useNoticeSchema()

const [registerForm, { setFieldsValue, getFieldsValue }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: false,
})

const scopeTargets = ref<
  { targetType: string, targetId: number, targetName?: string }[]
>([])

const [registerModal, { openModal: openScopeModal, closeModal }] = useModal()

const targetTypeColor: Record<string, string> = {
  ROLE: 'info',
  DEPARTMENT: 'success',
  USER: 'warning',
}

function clearMismatchedTargets(newScopeType: string) {
  scopeTargets.value = scopeTargets.value.filter(
    t => t.targetType === newScopeType,
  )
}

async function resolveTargetNames(
  type: string,
  targets: { targetType: string, targetId: number, targetName?: string }[],
) {
  if (!targets.length)
    return
  let list: any[]
  if (type === 'ROLE') {
    const res = await RoleApi.all()
    list = Array.isArray(res) ? res : (res as any)?.list || []
  }
  else if (type === 'DEPARTMENT') {
    const res = await DepartmentApi.list({ page: 1, pageSize: 9999 })
    list = Array.isArray(res) ? res : (res as any)?.list || []
  }
  else if (type === 'USER') {
    const res = await UserManagerApi.list({ page: 1, pageSize: 9999 })
    list = Array.isArray(res) ? res : (res as any)?.list || []
  }
  else {
    return
  }
  const map = new Map(
    list.map((item: any) => [item.id, item.name || item.username]),
  )
  targets.forEach((t) => {
    const name = map.get(t.targetId)
    if (name)
      t.targetName = name
  })
}

onMounted(async () => {
  if (isUpdate.value) {
    try {
      const detail = await NoticeApi.detail(parsedId)
      setFieldsValue({
        title: detail.title || '',
        type: detail.type || 'NOTICE',
        content: detail.content || '',
        isPinned: detail.isPinned ?? false,
        isMandatory: detail.isMandatory ?? false,
        scopeType: detail.scopeType || 'ALL',
      })
      scopeTargets.value = (detail.scopeTargets || []).map((t: any) => ({
        targetType: t.targetType,
        targetId: t.targetId,
        targetName: t.targetName || `目标#${t.targetId}`,
      }))
      if (detail.scopeType && detail.scopeType !== 'ALL') {
        await resolveTargetNames(detail.scopeType, scopeTargets.value)
      }
    }
    catch {
      window.$message?.error?.('加载公告数据失败')
      goBack()
    }
  }
})

function goBack() {
  router.push('/notice/notice')
}

async function handleSubmit(status: number) {
  const values = getFieldsValue()
  if (values.scopeType !== 'ALL' && scopeTargets.value.length === 0) {
    window.$message?.warning?.('请先选择发布范围目标')
    return
  }

  loading.value = true
  try {
    const targets
      = scopeTargets.value.length > 0
        ? scopeTargets.value.map(t => ({
            targetType: t.targetType,
            targetId: t.targetId,
          }))
        : undefined

    const payload: Parameters<typeof NoticeApi.create>[0] = {
      ...values as any,
      status,
      scopeTargets: values.scopeType !== 'ALL' ? targets : undefined,
    }

    if (isUpdate.value) {
      await NoticeApi.update({ id: parsedId, ...payload })
      window.$message?.success?.('更新成功')
    }
    else {
      await NoticeApi.create(payload)
      window.$message?.success?.('创建成功')
    }
    goBack()
  }
  catch {
    /* handled by interceptor */
  }
  finally {
    loading.value = false
  }
}

function handleSaveDraft() {
  handleSubmit(0)
}

function handlePublish() {
  handleSubmit(1)
}

function removeTarget(index: number) {
  scopeTargets.value.splice(index, 1)
}

function handleOpenScopeModal() {
  const currentScopeType = getFieldsValue().scopeType
  clearMismatchedTargets(currentScopeType)
  openScopeModal({
    scopeType: currentScopeType,
    existingKeys: scopeTargets.value.map(
      t => `${t.targetType}-${t.targetId}`,
    ),
  })
}

function handleConfirmTargets(
  targets: { targetType: string, targetId: number, targetName?: string }[],
) {
  const type = targets[0]?.targetType
  if (type) {
    scopeTargets.value = [
      ...scopeTargets.value.filter(t => t.targetType !== type),
      ...targets,
    ]
  }
  closeModal()
}
</script>

<template>
  <div class="system-page">
    <n-page-header :title="isUpdate ? '编辑公告' : '新增公告'" @back="goBack">
      <template #extra>
        <n-button variant="text" @click="goBack">
          返回
        </n-button>
      </template>
    </n-page-header>

    <FormEdit :grid-props="{ cols: 2, xGap: 16 }" @register="registerForm">
      <template #scopeType="{ model }">
        <n-select
          :value="model.scopeType"
          :options="scopeTypeOptions"
          @update:value="
            (v) => {
              model.scopeType = v;
              clearMismatchedTargets(v);
            }
          "
        />
      </template>
      <template #scopeTargets>
        <div class="scope-targets__wrap">
          <div class="scope-targets__tags">
            <template v-if="scopeTargets.length">
              <n-tag
                v-for="(t, i) in scopeTargets"
                :key="i"
                :type="targetTypeColor[t.targetType] as any"
                closable
                @close="removeTarget(i)"
              >
                {{ t.targetName || `目标#${t.targetId}` }}
              </n-tag>
            </template>
            <span v-else class="scope-targets__empty">未选择</span>
          </div>
          <n-button size="small" @click="handleOpenScopeModal">
            选择目标
          </n-button>
        </div>
      </template>
      <template #content="{ model }">
        <WangEditor v-model="model.content" :height="420" />
      </template>
    </FormEdit>

    <n-flex justify="center">
      <n-button @click="goBack">
        取消
      </n-button>
      <n-button :loading="loading" @click="handleSaveDraft">
        保存草稿
      </n-button>
      <n-button type="primary" :loading="loading" @click="handlePublish">
        保存并发布
      </n-button>
    </n-flex>

    <ScopeTargetModal
      @register="registerModal"
      @confirm="handleConfirmTargets"
    />
  </div>
</template>

<style lang="scss" scoped>
.scope-targets {
  &__wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 44px;
    padding: 4px 10px;
    border: 1px solid var(--n-border-color, #e0e0e6);
    border-radius: var(--n-border-radius, 4px);
    background: var(--n-color, #fff);
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #2080f0;
      box-shadow: 0 0 0 2px rgba(32, 128, 240, 0.12);
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__empty {
    color: #aaa;
    font-size: 13px;
    user-select: none;
  }
}
</style>
