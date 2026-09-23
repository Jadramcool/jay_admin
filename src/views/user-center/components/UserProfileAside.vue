<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import dayjs from 'dayjs'
import { roleTypeOptions } from '@/constants'

const props = defineProps<{
  userInfo: Api.UserInfo
  avatarUrl: string
}>()

const emit = defineEmits<{
  avatarUpload: [options: UploadCustomRequestOptions]
}>()

const roleTypeLabel = computed(() =>
  roleTypeOptions.find(o => o.value === props.userInfo.roleType)?.label || props.userInfo.roleType,
)

const isAdmin = computed(() => props.userInfo.roleType === 'admin')

const joinedLabel = computed(() =>
  props.userInfo.joinedAt ? dayjs(props.userInfo.joinedAt).format('YYYY年M月') : '',
)

function onAvatarUpload(options: UploadCustomRequestOptions) {
  emit('avatarUpload', options)
}
</script>

<template>
  <section class="hero">
    <div class="hero__banner" aria-hidden="true" />

    <div class="hero__body">
      <!-- 头像：点击更换（n-upload 不直接参与 flex 布局，避免其内部宽度撑满整行） -->
      <div class="hero__avatar-col">
        <n-upload
          :show-file-list="false"
          accept="image/*"
          :custom-request="onAvatarUpload"
        >
          <button class="hero__avatar" type="button" aria-label="更换头像" title="点击更换头像">
            <n-avatar :size="72" round :src="avatarUrl" class="hero__avatar-img">
              <JIcon v-if="!avatarUrl" icon="icon-park-outline:avatar" :size="30" aria-hidden="true" />
            </n-avatar>
            <span class="hero__avatar-overlay" aria-hidden="true">
              <JIcon icon="icon-park-outline:camera" :size="16" />
            </span>
          </button>
        </n-upload>
      </div>

      <!-- 身份信息 -->
      <div class="hero__identity">
        <div class="hero__name-row">
          <h2 class="hero__name">
            {{ userInfo.name || userInfo.username || '—' }}
          </h2>
          <span class="hero__chip" :class="{ 'hero__chip--admin': isAdmin }">
            {{ roleTypeLabel }}
          </span>
        </div>
        <p class="hero__handle">
          @{{ userInfo.username }}
        </p>
        <div v-if="userInfo.roles?.length" class="hero__tags">
          <n-tag
            v-for="role in userInfo.roles"
            :key="role.id"
            size="small"
            round
            :bordered="false"
            class="hero__tag"
          >
            {{ role.name }}
          </n-tag>
        </div>
      </div>

      <!-- 右侧元信息 -->
      <dl class="hero__meta">
        <div class="hero__meta-item">
          <dt class="hero__meta-label">
            部门
          </dt>
          <dd class="hero__meta-value" :title="userInfo.departmentName || undefined">
            {{ userInfo.departmentName || '未分配' }}
          </dd>
        </div>
        <div v-if="userInfo.position" class="hero__meta-item">
          <dt class="hero__meta-label">
            职位
          </dt>
          <dd class="hero__meta-value" :title="userInfo.position">
            {{ userInfo.position }}
          </dd>
        </div>
        <div v-if="joinedLabel" class="hero__meta-item">
          <dt class="hero__meta-label">
            入职
          </dt>
          <dd class="hero__meta-value">
            {{ joinedLabel }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--layout-border-light);
  border-radius: var(--radius-md);
  background: var(--card-bg);
}

/* 顶部品牌色带：静态渐变，无动画 */
.hero__banner {
  position: absolute;
  inset: 0 0 auto;
  height: 64px;
  background:
    radial-gradient(ellipse 60% 120% at 85% 0%, rgba(var(--primary-color-rgb), 0.18), transparent),
    linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.14), rgba(var(--primary-color-rgb), 0.04) 60%, transparent);
}

.hero__body {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
}

/* ---- 头像 ---- */
.hero__avatar-col {
  flex-shrink: 0;
}

/* n-upload 内部 trigger 会带额外空隙，压缩为紧贴按钮 */
.hero__avatar-col :deep(.n-upload) {
  display: inline-flex;
  line-height: 0;
}

.hero__avatar {
  position: relative;
  display: inline-flex;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  font: inherit;
  line-height: 0;
  cursor: pointer;

  &:hover .hero__avatar-overlay,
  &:focus-visible .hero__avatar-overlay {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 3px;
  }
}

.hero__avatar-img {
  box-shadow:
    0 0 0 3px var(--card-bg),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.hero__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* ---- 身份信息 ---- */
.hero__identity {
  flex: 1;
  min-width: 0;
}

.hero__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hero__name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--card-header-text);
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero__chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
  border: 1px solid rgba(var(--primary-color-rgb), 0.18);
  white-space: nowrap;

  &--admin {
    color: #fff;
    background: var(--primary-color);
    border-color: transparent;
  }
}

.hero__handle {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--card-sub-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

/* ---- 右侧元信息 ---- */
.hero__meta {
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0 4px 0 18px;
  border-left: 1px solid var(--card-divider);
  flex-shrink: 0;
}

.hero__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  max-width: 160px;
}

.hero__meta-label {
  font-size: 11.5px;
  color: var(--card-sub-text);
}

.hero__meta-value {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--card-header-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 860px) {
  .hero__body {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 18px 16px;
  }

  .hero__identity {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero__name-row {
    justify-content: center;
  }

  .hero__name {
    max-width: 100%;
  }

  .hero__tags {
    justify-content: center;
  }

  .hero__meta {
    border-left: none;
    padding: 12px 0 0;
    border-top: 1px solid var(--card-divider);
    width: 100%;
    justify-content: space-around;
    gap: 8px;
  }

  .hero__meta-item {
    align-items: center;
    max-width: 33%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__avatar-overlay {
    transition: none;
  }
}
</style>
