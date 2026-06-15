<template>
  <BasicModal
    title="分配角色"
    @register="registerModal"
    @ok="handleOk"
    draggable>
    <template v-if="roles.length > 0">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-sm text-gray-500">点击选择角色，最多选 5 个</p>
        <n-button
          v-if="checkedRoleIds.length > 0"
          text
          size="small"
          type="warning"
          @click="checkedRoleIds = []">
          取消全部
        </n-button>
      </div>
      <n-grid :cols="2" :x-gap="12" :y-gap="12">
        <n-gi v-for="role in roles" :key="role.id">
          <div
            class="role-card"
            :class="{
              selected: checkedRoleIds.includes(role.id),
              disabled:
                !checkedRoleIds.includes(role.id) && checkedRoleIds.length >= 5,
            }"
            @click="toggleRole(role.id)">
            <div class="role-card-left">
              <div class="role-icon" :class="getIconClass(role.code)">
                {{ role.name.charAt(0) }}
              </div>
              <div>
                <div class="role-name">{{ role.name }}</div>
                <div class="role-code">{{ role.code }}</div>
              </div>
            </div>
            <div
              class="role-check"
              :class="{ visible: checkedRoleIds.includes(role.id) }">
              <Icon icon="mdi:check-circle" width="18" color="#18a058" />
            </div>
          </div>
        </n-gi>
      </n-grid>
      <div class="mt-3 text-xs text-gray-400">
        已选择 {{ checkedRoleIds.length }} 个角色
      </div>
    </template>
    <n-empty v-else description="暂无可用角色" />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { RoleApi, UserManagerApi } from "@/api/system";
import { useModalInner } from "@/components/Modal/src/hooks/useModal";

const emit = defineEmits<{
  success: [];
  register: [instance: any, uuid: number];
}>();

const userId = ref<number>(0);
const checkedRoleIds = ref<number[]>([]);
const roles = ref<any[]>([]);

const [registerModal, { closeModal }] = useModalInner(async (data: any) => {
  if (data?.record) {
    userId.value = data.record.id;
    checkedRoleIds.value = data.record.roles?.map((r: any) => r.id) || [];
  }
  const res = await RoleApi.all();
  roles.value = res || [];
});

function toggleRole(id: number) {
  const idx = checkedRoleIds.value.indexOf(id);
  if (idx > -1) {
    checkedRoleIds.value.splice(idx, 1);
  } else if (checkedRoleIds.value.length < 5) {
    checkedRoleIds.value.push(id);
  }
}

function getIconClass(code: string) {
  const map: Record<string, string> = {
    ADMIN: "icon-admin",
    EDITOR: "icon-editor",
    VIEWER: "icon-viewer",
    OPERATOR: "icon-operator",
    FINANCE: "icon-finance",
    DEVELOPER: "icon-dev",
    TESTER: "icon-tester",
    PROJECT_MGR: "icon-pm",
    DEPT_MGR: "icon-dept",
    AUDITOR: "icon-auditor",
  };
  return map[code] || "icon-default";
}

async function handleOk() {
  const selectedNames = checkedRoleIds.value
    .map((id) => roles.value.find((r: any) => r.id === id)?.name)
    .filter(Boolean)
    .join("、");
  const content =
    checkedRoleIds.value.length === 0
      ? "确定要取消该用户的所有角色吗？"
      : `确定要为该用户分配以下角色？\n${selectedNames}`;

  window.$dialog?.warning({
    title: "确认分配",
    content,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await UserManagerApi.assignRoles(userId.value, checkedRoleIds.value);
      window.$message?.success?.("分配角色成功");
      closeModal();
      emit("success");
    },
  });
}
</script>

<style scoped>
.role-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #fff;
  user-select: none;
}
.role-card:hover {
  border-color: #2080f0;
  background: #f8fbff;
}
.role-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.role-card.disabled:hover {
  border-color: #e5e7eb;
  background: #fff;
}
.role-card.selected {
  border-color: #18a058;
  background: #f6fffa;
}
.role-card.selected:hover {
  border-color: #18a058;
  background: #f6fffa;
}
.role-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.role-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.icon-admin {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
}
.icon-editor {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.icon-viewer {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}
.icon-operator {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.icon-finance {
  background: linear-gradient(135deg, #10b981, #059669);
}
.icon-dev {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.icon-tester {
  background: linear-gradient(135deg, #ec4899, #db2777);
}
.icon-pm {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.icon-dept {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.icon-auditor {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.icon-default {
  background: linear-gradient(135deg, #78716c, #57534e);
}
.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.3;
}
.role-code {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.3;
  margin-top: 1px;
}
.role-check {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.role-check.visible {
  opacity: 1;
}
</style>

