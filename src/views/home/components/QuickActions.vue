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
  <div class="quick">
    <h3 class="quick__title">
      快捷入口
    </h3>
    <div class="quick__grid">
      <button
        v-for="link in quickLinks"
        :key="link.label"
        class="quick__item"
        :style="{ '--accent': link.color }"
        @click="go(link.route)"
      >
        <div class="quick__item-icon">
          {{ link.label.charAt(0) }}
        </div>
        <span class="quick__item-label">{{ link.label }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick {
  padding: 20px 22px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--card-color) 90%, transparent);
  height: 100%;
}

.quick__title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color-1);
}

.quick__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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
    background: color-mix(in srgb, var(--accent) 8%, var(--card-color));
    transform: translateY(-1px);
  }
}

.quick__item-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.quick__item:hover .quick__item-icon {
  transform: scale(1.1);
}

.quick__item-label {
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .quick__grid {
    grid-template-columns: 1fr;
  }
}
</style>
