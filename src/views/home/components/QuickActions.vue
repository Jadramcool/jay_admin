<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const quickLinks = [
  { label: '用户管理', route: '/system/user/list', color: '#18a058', desc: '管理系统用户' },
  { label: '角色管理', route: '/system/role', color: '#2080f0', desc: '配置角色权限' },
  { label: '菜单管理', route: '/system/menu', color: '#f0a020', desc: '维护导航路由' },
  { label: '部门管理', route: '/system/department', color: '#7c3aed', desc: '组织架构管理' },
  { label: '操作日志', route: '/system/op-log', color: '#d03050', desc: '审计安全追溯' },
  { label: '通知管理', route: '/notice/notice', color: '#ec4899', desc: '发布系统通知' },
  { label: '个人中心', route: '/user-center', color: '#0ec7b0', desc: '编辑个人资料' },
  { label: '系统配置', route: '/system/config', color: '#909090', desc: '维护运行参数' },
]

function go(route: string) {
  router.push(route)
}
</script>

<template>
  <AppCard title="快捷入口">
    <div class="quick__grid">
      <button v-for="link in quickLinks" :key="link.label" class="quick__item" :style="{ '--c': link.color }" @click="go(link.route)">
        <div class="quick__icon">
          {{ link.label.charAt(0) }}
        </div>
        <span class="quick__label">{{ link.label }}</span>
      </button>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
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
