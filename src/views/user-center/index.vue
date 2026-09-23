<script setup lang="ts">
import UserPasswordForm from './components/UserPasswordForm.vue'
import UserProfileAside from './components/UserProfileAside.vue'
import UserProfileForm from './components/UserProfileForm.vue'
import { useProfileForm } from './composables/useProfileForm'

type Section = 'profile' | 'password'

// 支持外部入口直达指定分区，如 /user-center?section=password（修改密码捷径）
const route = useRoute()
const activeSection = shallowRef<Section>(
  route.query.section === 'password' ? 'password' : 'profile',
)

const sections: { key: Section, label: string, desc: string, icon: string }[] = [
  { key: 'profile', label: '编辑资料', desc: '个人信息与联系方式', icon: 'icon-park-outline:edit-one' },
  { key: 'password', label: '安全设置', desc: '密码与账户安全', icon: 'icon-park-outline:lock-one' },
]

const { userInfo, avatarUrl, handleAvatarUpload, loadUserInfo } = useProfileForm()

onMounted(() => {
  loadUserInfo()
})

// 离开路由前的未保存提示（仅资料分区有表单状态）
const profileFormRef = useTemplateRef<InstanceType<typeof UserProfileForm>>('profileFormRef')

onBeforeRouteLeave((to, from, next) => {
  if (activeSection.value === 'profile' && profileFormRef.value?.checkUnsaved?.()) {
    window.$dialog?.warning({
      title: '未保存的更改',
      content: '您有未保存的个人信息更改，确定要离开吗？',
      positiveText: '离开',
      negativeText: '取消',
      onPositiveClick: () => next(),
      onNegativeClick: () => next(false),
    })
  }
  else {
    next()
  }
})

// 切换分区时，资料表单有未保存更改则先确认，避免静默丢失
function handleSelectSection(section: Section) {
  if (section === activeSection.value)
    return
  if (section !== 'profile' && profileFormRef.value?.checkUnsaved?.()) {
    window.$dialog?.warning({
      title: '未保存的更改',
      content: '切换到「安全设置」将丢弃未保存的资料更改，确定继续吗？',
      positiveText: '继续切换',
      negativeText: '继续编辑',
      onPositiveClick: () => {
        activeSection.value = section
      },
    })
    return
  }
  activeSection.value = section
}
</script>

<template>
  <div class="uc-page">
    <UserProfileAside
      :user-info="userInfo"
      :avatar-url="avatarUrl"
      @avatar-upload="handleAvatarUpload"
    />

    <div class="uc-layout">
      <!-- 分区导航：桌面纵向吸顶 / 窄屏横向 -->
      <nav class="uc-nav" aria-label="个人中心导航">
        <button
          v-for="s in sections"
          :key="s.key"
          type="button"
          class="uc-nav__item"
          :class="{ 'uc-nav__item--active': activeSection === s.key }"
          :aria-current="activeSection === s.key ? 'page' : undefined"
          @click="handleSelectSection(s.key)"
        >
          <span class="uc-nav__icon" aria-hidden="true">
            <JIcon :icon="s.icon" :size="16" />
          </span>
          <span class="uc-nav__text">
            <span class="uc-nav__label">{{ s.label }}</span>
            <span class="uc-nav__desc">{{ s.desc }}</span>
          </span>
        </button>
      </nav>

      <!-- 分区内容 -->
      <main class="uc-main">
        <Transition name="uc-fade" mode="out-in">
          <UserProfileForm
            v-if="activeSection === 'profile'"
            ref="profileFormRef"
            key="profile"
            :user-data="userInfo"
            @save-success="loadUserInfo"
          />
          <UserPasswordForm
            v-else
            key="password"
          />
        </Transition>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 路由已配置 meta.withContentCard=false，页面在 layout content（padding: 18px 20px）内自绘 */
.uc-page {
  min-height: 100%;
}

.uc-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 16px;
}

/* ---- 分区导航 ---- */
.uc-nav {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  width: 208px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--layout-border-light);
  border-radius: var(--radius-md);
  background: var(--card-bg);
}

.uc-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--layout-bg-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  &--active,
  &--active:hover {
    background: rgba(var(--primary-color-rgb), 0.08);
  }

  &--active .uc-nav__icon {
    color: #fff;
    background: var(--primary-color);
  }

  &--active .uc-nav__label {
    color: var(--primary-color);
  }
}

.uc-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  color: var(--card-sub-text);
  background: var(--layout-bg-hover);
  flex-shrink: 0;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.uc-nav__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.uc-nav__label {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--card-header-text);
  transition: color 0.2s ease;
}

.uc-nav__desc {
  font-size: 11.5px;
  line-height: 1.35;
  color: var(--card-sub-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- 内容列 ---- */
.uc-main {
  flex: 1;
  min-width: 0;
}

.uc-fade-enter-active,
.uc-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.uc-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.uc-fade-leave-to {
  opacity: 0;
}

@media (max-width: 860px) {
  .uc-layout {
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  }

  .uc-nav {
    position: static;
    width: 100%;
    flex-direction: row;
  }

  .uc-nav__item {
    flex: 1;
    justify-content: center;
  }

  .uc-nav__desc {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .uc-page *,
  .uc-page *::before,
  .uc-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
