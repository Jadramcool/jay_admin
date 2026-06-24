<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import UserPasswordForm from './components/UserPasswordForm.vue'
import UserProfileAside from './components/UserProfileAside.vue'
import UserProfileForm from './components/UserProfileForm.vue'
import { useProfileForm } from './composables/useProfileForm'

type Section = 'profile' | 'password'

const activeSection = ref<Section>('profile')

const sections: { key: Section, label: string, desc: string, icon: string }[] = [
  { key: 'profile', label: '编辑资料', desc: '个人信息与联系方式', icon: 'icon-park-outline:edit-one' },
  { key: 'password', label: '安全设置', desc: '密码与账户安全', icon: 'icon-park-outline:lock-one' },
]

const menuOptions = computed<MenuOption[]>(() =>
  sections.map(s => ({
    key: s.key,
    label: () =>
      h('span', { class: 'uc-nav__label' }, [
        h('span', { class: 'uc-nav__title' }, s.label),
        h('span', { class: 'uc-nav__desc' }, s.desc),
      ]),
    icon: renderIcon(s.icon),
  })),
)

const {
  userInfo,
  avatarUrl,
  handleAvatarUpload,
  loadUserInfo,
} = useProfileForm()

onMounted(() => {
  loadUserInfo()
})

// Route leave guard for unsaved profile changes
const profileFormRef = ref<InstanceType<typeof UserProfileForm> | null>(null)

onBeforeRouteLeave((to, from, next) => {
  if (profileFormRef.value?.checkUnsaved?.()) {
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
</script>

<template>
  <div class="uc-page">
    <!-- Ambient page backdrop -->
    <div class="uc-page__ambient" aria-hidden="true">
      <div class="uc-page__glow uc-page__glow--a" />
      <div class="uc-page__glow uc-page__glow--b" />
      <div class="uc-page__grain" />
    </div>

    <div class="uc-page__body">
      <UserProfileAside
        :user-info="userInfo"
        :avatar-url="avatarUrl"
        @avatar-upload="handleAvatarUpload"
      />

      <div class="uc-layout">
        <!-- Sticky vertical nav -->
        <nav class="uc-nav" aria-label="个人中心导航">
          <n-menu
            v-model:value="activeSection"
            :options="menuOptions"
            mode="vertical"
            class="uc-nav__menu"
          />
        </nav>

        <!-- Content -->
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
              v-else-if="activeSection === 'password'"
              key="password"
            />
          </Transition>
        </main>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.uc-page {
  position: relative;
  margin: -14px;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(140, 92, 246, 0.07), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(140, 92, 246, 0.05), transparent),
    color-mix(in srgb, var(--card-color) 35%, var(--body-color, #f4f5f7));
}

html.dark .uc-page {
  background:
    radial-gradient(ellipse 70% 40% at 80% -5%, rgba(140, 92, 246, 0.1), transparent),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(140, 92, 246, 0.07), transparent),
    color-mix(in srgb, var(--card-color) 25%, rgb(20, 20, 24));
}

/* ---- Ambient backdrop ---- */
.uc-page__ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.uc-page__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;

  &--a {
    width: 380px;
    height: 380px;
    top: -150px;
    right: -80px;
    background: rgba(140, 92, 246, 0.22);
  }

  &--b {
    width: 280px;
    height: 280px;
    bottom: -90px;
    left: -50px;
    background: rgba(35, 178, 130, 0.16);
  }
}

.uc-page__grain {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
  mix-blend-mode: overlay;
}

html.dark .uc-page__grain {
  opacity: 0.18;
  mix-blend-mode: soft-light;
}

.uc-page__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0 20px;
  min-height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .uc-page * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.uc-layout {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 0 24px;
  flex: 1;
  min-height: 0;
}

/* ---- Floating nav ---- */
.uc-nav {
  position: sticky;
  top: 14px;
  flex-shrink: 0;
  width: 200px;
  padding: 6px;
  border-radius: calc(var(--border-radius) + 6px);
  background:
    linear-gradient(180deg, rgba(140, 92, 246, 0.08) 0%, rgba(140, 92, 246, 0.02) 100%),
    color-mix(in srgb, var(--card-color) 75%, transparent);
  border: 1px solid rgba(140, 92, 246, 0.18);
  box-shadow:
    0 8px 24px rgba(140, 92, 246, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

html.dark .uc-nav {
  background:
    linear-gradient(180deg, rgba(140, 92, 246, 0.14) 0%, rgba(140, 92, 246, 0.04) 100%),
    color-mix(in srgb, rgb(28, 28, 32) 75%, transparent);
  border-color: rgba(140, 92, 246, 0.22);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 2px 6px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.uc-nav__menu {
  :deep(.n-menu) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0;
  }

  :deep(.n-menu-item) {
    border-radius: calc(var(--border-radius) + 2px);
    overflow: hidden;
  }

  :deep(.n-menu-item-content) {
    position: relative;
    padding: 9px 12px !important;
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      transform 0.2s ease;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 40%;
      border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, var(--primary-color), var(--primary-color-hover));
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  :deep(.n-menu-item-content:hover) {
    transform: translateX(2px);
  }

  :deep(.n-menu-item-content:hover .uc-nav__title) {
    color: var(--text-color-1);
  }

  :deep(.n-menu-item-content--selected) {
    background: linear-gradient(135deg, rgba(140, 92, 246, 0.16), rgba(140, 92, 246, 0.06));
    color: rgb(122, 78, 228);
    box-shadow:
      inset 0 1px 1px rgba(140, 92, 246, 0.1),
      0 1px 2px rgba(140, 92, 246, 0.08);

    &::after {
      transform: translateY(-50%) scaleY(1);
      background: linear-gradient(180deg, rgb(140, 92, 246), rgb(110, 70, 200));
    }

    &:hover {
      background: linear-gradient(135deg, rgba(140, 92, 246, 0.2), rgba(140, 92, 246, 0.08));
      transform: translateX(0);
    }
  }

  :deep(.n-menu-item-content--selected .n-menu-item-content__icon) {
    color: #fff !important;
    background: linear-gradient(135deg, rgb(140, 92, 246), rgb(110, 70, 200));
    box-shadow: 0 4px 12px rgba(140, 92, 246, 0.36);
    transform: scale(1.05);
  }

  :deep(.n-menu-item-content--selected .uc-nav__title) {
    color: rgb(122, 78, 228);
  }

  :deep(.n-menu-item-content--selected .uc-nav__desc) {
    color: rgba(140, 92, 246, 0.7);
  }

  :deep(.n-menu-item-content__icon) {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-right: 8px;
    border-radius: var(--border-radius);
    color: var(--text-color-3) !important;
    background: var(--hover-color);
    transition:
      color 0.25s ease,
      background 0.25s ease,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.25s ease;

    svg {
      width: 15px;
      height: 15px;
    }
  }

  :deep(.uc-nav__label) {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  :deep(.uc-nav__title) {
    font-family: var(--font-family);
    font-size: 13.5px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--text-color-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.25s ease;
  }

  :deep(.uc-nav__desc) {
    font-size: 11.5px;
    color: var(--text-color-3);
    line-height: 1.35;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.25s ease;
  }
}

/* ---- Main content ---- */
.uc-main {
  flex: 1;
  min-width: 0;
}

.uc-fade-enter-active,
.uc-fade-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.uc-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.uc-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 860px) {
  .uc-page__body {
    padding: 12px 0 16px;
  }

  .uc-layout {
    flex-direction: column;
    padding: 0 12px;
    gap: 12px;
  }

  .uc-nav {
    position: static;
    width: 100%;
    padding: 5px;
  }

  .uc-nav__menu {
    :deep(.n-menu) {
      flex-direction: row;
    }

    :deep(.n-menu-item) {
      flex: 1;
    }

    :deep(.n-menu-item-content) {
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 8px 6px !important;

      &::after {
        left: 50%;
        top: 0;
        transform: translateX(-50%) scaleX(0);
        width: 30%;
        height: 3px;
        border-radius: 0 0 3px 3px;
      }
    }

    :deep(.n-menu-item-content:hover) {
      transform: translateY(-2px);
    }

    :deep(.n-menu-item-content--selected::after) {
      transform: translateX(-50%) scaleX(1);
    }

    :deep(.n-menu-item-content__icon) {
      margin-right: 0;
    }
  }

  .uc-nav__desc {
    display: none;
  }
}
</style>
