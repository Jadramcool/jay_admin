<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const quickLinks = [
  { label: '用户管理', route: '/system/user', color: '#18a058', desc: '管理系统用户' },
  { label: '角色管理', route: '/system/role', color: '#2080f0', desc: '配置角色权限' },
  { label: '菜单管理', route: '/system/menu', color: '#f0a020', desc: '维护导航路由' },
  { label: '部门管理', route: '/system/department', color: '#7c3aed', desc: '组织架构管理' },
  { label: '操作日志', route: '/system/operation-log', color: '#d03050', desc: '审计安全追溯' },
  { label: '通知管理', route: '/notice', color: '#ec4899', desc: '发布系统通知' },
  { label: '个人中心', route: '/user-center', color: '#0ec7b0', desc: '编辑个人资料' },
  { label: '系统设置', route: '/settings', color: '#909090', desc: '系统配置选项' },
]

function go(route: string) {
  if (route === '/settings') {
    window.dispatchEvent(new CustomEvent('toggle-settings'))
    return
  }
  router.push(route)
}
</script>

<template>
  <n-card title="快捷入口" :bordered="false" size="small" class="card card--quick" content-style="padding: 0 20px 20px">
    <div class="quick__grid">
      <button v-for="link in quickLinks" :key="link.label" class="quick__item" :style="{ '--c': link.color }" @click="go(link.route)">
        <div class="quick__icon">
          {{ link.label.charAt(0) }}
        </div>
        <span class="quick__label">{{ link.label }}</span>
      </button>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  height: 100%;

  html.dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  :deep(.n-card-header) {
    padding: 18px 20px 0 !important;
  }

  :deep(.n-card-header__title) {
    font-size: 14px !important;
    font-weight: 700 !important;
  }
}

.quick__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.quick__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: left;
  color: var(--text-color-2);

  &:hover {
    background: color-mix(in srgb, var(--c) 8%, transparent);
    transform: translateY(-1px);
  }
}

.quick__icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--c) 10%, transparent);
  color: var(--c);
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.quick__item:hover .quick__icon {
  transform: scale(1.1);
}

.quick__label {
  font-size: 13px;
  font-weight: 600;
}
</style>
