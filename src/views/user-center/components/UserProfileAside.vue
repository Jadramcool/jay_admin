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

function onAvatarUpload(options: UploadCustomRequestOptions) {
  emit('avatarUpload', options)
}
</script>

<template>
  <section class="hero">
    <!-- Gradient banner backdrop -->
    <div class="hero__banner" aria-hidden="true">
      <div class="hero__banner-mesh" />
      <div class="hero__banner-glow hero__banner-glow--a" />
      <div class="hero__banner-glow hero__banner-glow--b" />
      <div class="hero__banner-glow hero__banner-glow--c" />
      <div class="hero__banner-noise" />
    </div>

    <div class="hero__body">
      <!-- Avatar with soft halo + upload overlay -->
      <div class="hero__avatar-col">
        <n-upload
          :show-file-list="false"
          accept="image/*"
          :custom-request="onAvatarUpload"
        >
          <button class="hero__avatar" type="button" aria-label="更换头像">
            <span class="hero__avatar-ring" aria-hidden="true" />
            <span class="hero__avatar-ring hero__avatar-ring--slow" aria-hidden="true" />
            <n-avatar :size="76" round :src="avatarUrl" class="hero__avatar-img">
              <JIcon v-if="!avatarUrl" icon="icon-park-outline:avatar" :size="34" aria-hidden="true" />
            </n-avatar>
            <span class="hero__avatar-overlay" aria-hidden="true">
              <JIcon icon="icon-park-outline:camera" :size="18" />
            </span>
            <span class="hero__avatar-status" aria-hidden="true" />
          </button>
        </n-upload>
      </div>

      <!-- Identity -->
      <div class="hero__identity">
        <div class="hero__name-row">
          <h2 class="hero__name">
            {{ userInfo.name || userInfo.username || '—' }}
          </h2>
          <span class="hero__chip" :class="{ 'hero__chip--admin': isAdmin }">
            <JIcon :icon="isAdmin ? 'icon-park-outline:star' : 'icon-park-outline:user'" :size="12" aria-hidden="true" />
            {{ roleTypeLabel }}
          </span>
        </div>
        <p class="hero__handle">
          @{{ userInfo.username }}
        </p>

        <!-- Role tags -->
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

      <!-- Meta info column (right) -->
      <dl class="hero__meta">
        <div class="hero__meta-item" :title="userInfo.departmentName || '未分配部门'">
          <span class="hero__meta-icon" aria-hidden="true">
            <JIcon icon="icon-park-outline:building-one" :size="14" />
          </span>
          <div class="hero__meta-text">
            <span class="hero__meta-label">部门</span>
            <span class="hero__meta-value">{{ userInfo.departmentName || '未分配' }}</span>
          </div>
        </div>
        <div v-if="userInfo.position" class="hero__meta-item" :title="userInfo.position">
          <span class="hero__meta-icon" aria-hidden="true">
            <JIcon icon="icon-park-outline:peoples" :size="14" />
          </span>
          <div class="hero__meta-text">
            <span class="hero__meta-label">职位</span>
            <span class="hero__meta-value">{{ userInfo.position }}</span>
          </div>
        </div>
        <div v-if="userInfo.joinedAt" class="hero__meta-item">
          <span class="hero__meta-icon" aria-hidden="true">
            <JIcon icon="icon-park-outline:calendar" :size="14" />
          </span>
          <div class="hero__meta-text">
            <span class="hero__meta-label">入职</span>
            <span class="hero__meta-value">{{ dayjs(userInfo.joinedAt).format('YYYY年M月') }}</span>
          </div>
        </div>
      </dl>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(var(--primary-color-rgb), 0.06) 0%, transparent 38%), var(--card-color);
  border-radius: calc(var(--border-radius) + 8px);
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
  isolation: isolate;
  margin: 0 24px;
}

/* ---- Banner backdrop with brand gradient ---- */
.hero__banner {
  position: absolute;
  inset: 0 0 auto 0;
  height: 78px;
  background:
    linear-gradient(
      135deg,
      rgba(var(--primary-color-rgb), 0.32),
      rgba(var(--primary-color-rgb), 0.08) 55%,
      transparent
    ),
    linear-gradient(180deg, rgba(var(--primary-color-rgb), 0.14), transparent);
  z-index: 0;
}

.hero__banner-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(var(--primary-color-rgb), 0.22), transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(var(--primary-color-rgb), 0.16), transparent 45%);
}

.hero__banner-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  opacity: 0.5;

  &--a {
    width: 200px;
    height: 200px;
    top: -90px;
    right: 6%;
    background: rgba(var(--primary-color-rgb), 0.45);
    animation: float 8s ease-in-out infinite;
  }

  &--b {
    width: 160px;
    height: 160px;
    top: -50px;
    left: 16%;
    background: rgba(var(--primary-color-rgb), 0.28);
    animation: float 10s ease-in-out infinite reverse;
  }

  &--c {
    width: 120px;
    height: 120px;
    top: -20px;
    right: 38%;
    background: rgba(var(--primary-color-rgb), 0.18);
    animation: float 12s ease-in-out infinite;
  }
}

.hero__banner-noise {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 96px 96px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.04);
  }
}

/* ---- Body: 3-column layout (avatar | identity | meta) ---- */
.hero__body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 38px 24px 18px;
}

/* ---- Avatar ---- */
.hero__avatar-col {
  flex-shrink: 0;
}

.hero__avatar {
  position: relative;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  border-radius: 50%;
  line-height: 0;
  display: inline-flex;

  &:hover .hero__avatar-overlay {
    opacity: 1;
  }

  &:hover .hero__avatar-img {
    transform: scale(1.03);
  }

  &:hover .hero__avatar-ring {
    opacity: 1;
    transform: scale(1.06);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 4px;
  }
}

.hero__avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(var(--primary-color-rgb), 0.7),
    rgba(var(--primary-color-rgb), 0.1),
    rgba(var(--primary-color-rgb), 0.7)
  );
  opacity: 0.55;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  z-index: -1;
  animation: spin 10s linear infinite;

  &--slow {
    inset: -9px;
    opacity: 0.22;
    background: conic-gradient(
      from 180deg,
      rgba(var(--primary-color-rgb), 0.4),
      transparent,
      rgba(var(--primary-color-rgb), 0.4)
    );
    animation: spin 18s linear infinite reverse;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hero__avatar-img {
  box-shadow:
    0 0 0 5px var(--card-color),
    0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s ease;
}

.hero__avatar-overlay {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.hero__avatar-status {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--primary-color);
  border: 3px solid var(--card-color);
  box-shadow: 0 0 0 1px rgba(var(--primary-color-rgb), 0.35);

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
    opacity: 0;
    animation: pulse 2s ease-out infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* ---- Identity ---- */
.hero__identity {
  min-width: 0;
  flex: 1;
  padding-bottom: 4px;
}

.hero__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hero__name {
  font-family: var(--font-family);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  text-wrap: balance;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
  background: linear-gradient(135deg, var(--text-color-1), var(--text-color-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.12);
  white-space: nowrap;
  border: 1px solid rgba(var(--primary-color-rgb), 0.18);

  &--admin {
    color: #fff;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.28);
  }
}

.hero__handle {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--text-color-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.hero__tag {
  background: rgba(var(--primary-color-rgb), 0.08) !important;
  color: var(--text-color-2) !important;
  transition: transform 0.2s ease !important;

  &:hover {
    transform: translateY(-1px);
  }
}

/* ---- Meta column (right side) ---- */
.hero__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  flex-shrink: 0;
  min-width: 160px;
  max-width: 220px;
  padding-bottom: 4px;
}

.hero__meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: calc(var(--border-radius) + 2px);
  color: var(--text-color-2);
  background: color-mix(in srgb, var(--hover-color) 70%, transparent);
  border: 1px solid var(--border-color);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(var(--primary-color-rgb), 0.06);
    border-color: rgba(var(--primary-color-rgb), 0.2);
    transform: translateX(-2px);
  }
}

.hero__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--border-radius);
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
  flex-shrink: 0;
}

.hero__meta-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}

.hero__meta-label {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-color-3);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.hero__meta-value {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-color-1);
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero__meta-dot {
  display: none;
}

@media (max-width: 860px) {
  .hero {
    margin: 0 12px;
    border-radius: calc(var(--border-radius) + 6px);
  }

  .hero__banner {
    height: 70px;
  }

  .hero__body {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 16px 14px;
    gap: 14px;
  }

  .hero__identity {
    text-align: center;
    padding-bottom: 0;
  }

  .hero__name-row {
    justify-content: center;
  }

  .hero__name {
    max-width: 100%;
    font-size: 20px;
  }

  .hero__tags {
    justify-content: center;
  }

  .hero__meta {
    width: 100%;
    max-width: 320px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding-bottom: 0;

    .hero__meta-item {
      flex: 1 1 130px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__banner-glow,
  .hero__avatar-ring,
  .hero__avatar-status::after {
    animation: none;
  }

  .hero__avatar-overlay {
    transition: none;
  }
}
</style>
