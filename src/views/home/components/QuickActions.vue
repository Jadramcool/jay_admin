<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = [
  { label: '用户管理', icon: 'icon-park-outline:user', route: '/system/user', color: '#18a058', desc: '管理系统用户' },
  { label: '角色管理', icon: 'icon-park-outline:permissions', route: '/system/role', color: '#2080f0', desc: '配置角色权限' },
  { label: '菜单管理', icon: 'icon-park-outline:menu-fold', route: '/system/menu', color: '#f0a020', desc: '维护导航路由' },
  { label: '部门管理', icon: 'icon-park-outline:tree', route: '/system/department', color: '#7c3aed', desc: '组织架构管理' },
  { label: '操作日志', icon: 'icon-park-outline:log', route: '/system/operation-log', color: '#d03050', desc: '审计安全追溯' },
  { label: '通知管理', icon: 'icon-park-outline:notification', route: '/notice', color: '#ec4899', desc: '发布系统通知' },
  { label: '个人中心', icon: 'icon-park-outline:edit-one', route: '/user-center', color: '#0ec7b0', desc: '编辑个人资料' },
  { label: '系统设置', icon: 'icon-park-outline:setting', route: '/settings', color: '#909090', desc: '系统配置选项' },
]

function handleNavigate(route: string) {
  if (route === '/settings') {
    window.dispatchEvent(new CustomEvent('toggle-settings'))
    return
  }
  router.push(route)
}
</script>

<template>
  <n-card title="快捷操作" size="small" :bordered="false" class="qa-card">
    <div class="qa-grid">
      <div
        v-for="action in actions"
        :key="action.label"
        class="qa-item"
        :style="{ '--accent': action.color }"
        @click="handleNavigate(action.route)"
      >
        <div class="qa-item__icon">
          <Icon :icon="action.icon" />
        </div>
        <div class="qa-item__info">
          <span class="qa-item__label">{{ action.label }}</span>
          <span class="qa-item__desc">{{ action.desc }}</span>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.qa-card {
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  height: 100%;

  :deep(.n-card-header) {
    padding: 14px 18px !important;
  }

  :deep(.n-card-header__title) {
    font-size: 14px !important;
    font-weight: 700 !important;
  }

  :deep(.n-card__content) {
    padding: 0 18px 14px !important;
  }
}

.qa-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.qa-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  cursor: pointer;
  background: color-mix(in srgb, var(--card-color) 70%, transparent);
  border: 1px solid transparent;
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--accent) 6%, var(--card-color));
    border-color: color-mix(in srgb, var(--accent) 15%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 6%, transparent);
  }

  &:active {
    transform: translateY(0);
  }
}

.qa-item__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  font-size: 18px;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    background 0.25s ease;
}

.qa-item:hover .qa-item__icon {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}

.qa-item__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.qa-item__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-1);
  line-height: 1.3;
}

.qa-item__desc {
  font-size: 11.5px;
  color: var(--text-color-4);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .qa-grid {
    grid-template-columns: 1fr;
  }
}
</style>
