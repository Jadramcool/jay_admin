<script setup lang="ts">
import { NoticeApi } from "@/api/notice";
import { DepartmentApi, RoleApi, UserManagerApi } from "@/api/system";
import WangEditor from "@/components/WangEditor/index.vue";
import { noticeTypeOptions, scopeTypeOptions } from "@/constants";
import type { DataTableColumn } from "naive-ui";
import { h, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const noticeId = route.params.id as string | undefined;
const isUpdate = ref(!!noticeId);

const formData = ref({
  title: "",
  type: "NOTICE",
  content: "",
  status: 0,
  isPinned: false,
  isMandatory: false,
  scopeType: "ALL",
});
const scopeTargets = ref<
  { targetType: string; targetId: number; targetName?: string }[]
>([]);
const showScopeModal = ref(false);
const loading = ref(false);

// 编辑时加载数据
onMounted(async () => {
  if (isUpdate.value) {
    try {
      const detail = await NoticeApi.detail(Number(noticeId));
      formData.value = {
        title: detail.title || "",
        type: detail.type || "NOTICE",
        content: detail.content || "",
        status: detail.status ?? 0,
        isPinned: detail.isPinned ?? false,
        isMandatory: detail.isMandatory ?? false,
        scopeType: detail.scopeType || "ALL",
      };
      scopeTargets.value = (detail.scopeTargets || []).map((t: any) => ({
        targetType: t.targetType,
        targetId: t.targetId,
        targetName: t.targetName || `目标#${t.targetId}`,
      }));
    } catch {
      window.$message?.error?.("加载公告数据失败");
      router.push("/notice/notice");
    }
  }
});

function goBack() {
  router.push("/notice/notice");
}

async function handleSubmit() {
  if (!formData.value.title) {
    window.$message?.error?.("请输入公告标题");
    return;
  }
  loading.value = true;
  try {
    const targets =
      scopeTargets.value.length > 0
        ? scopeTargets.value.map((t) => ({
            targetType: t.targetType,
            targetId: t.targetId,
          }))
        : undefined;

    const payload = {
      ...formData.value,
      scopeTargets: formData.value.scopeType !== "ALL" ? targets : undefined,
    };

    if (isUpdate.value) {
      await NoticeApi.update({ id: Number(noticeId), ...payload } as any);
      window.$message?.success?.("更新成功");
    } else {
      await NoticeApi.create(payload as any);
      window.$message?.success?.("创建成功");
    }
    goBack();
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false;
  }
}

async function handleSaveDraft() {
  formData.value.status = 0;
  await handleSubmit();
}

async function handlePublish() {
  formData.value.status = 1;
  await handleSubmit();
}

function removeTarget(index: number) {
  scopeTargets.value.splice(index, 1);
}

// 角色选择
const roleList = ref<any[]>([]);
const roleLoading = ref(false);
const roleColumns: DataTableColumn[] = [
  { title: "角色编码", key: "code" },
  { title: "角色名称", key: "name" },
  {
    title: "操作",
    key: "actions",
    width: 80,
    render(row: any) {
      return h(
        "button",
        {
          class: "n-button n-button--small",
          onClick: () => {
            if (
              !scopeTargets.value.find(
                (t) => t.targetType === "ROLE" && t.targetId === row.id,
              )
            ) {
              scopeTargets.value.push({
                targetType: "ROLE",
                targetId: row.id,
                targetName: row.name,
              });
            }
          },
        },
        "添加",
      );
    },
  },
];
async function loadRoles() {
  roleLoading.value = true;
  try {
    const res = await RoleApi.all();
    roleList.value = Array.isArray(res) ? res : (res as any)?.list || [];
  } catch {
    roleList.value = [];
  } finally {
    roleLoading.value = false;
  }
}

// 用户选择
const userList = ref<any[]>([]);
const userLoading = ref(false);
const userColumns: DataTableColumn[] = [
  { title: "用户名", key: "username" },
  { title: "姓名", key: "name" },
  {
    title: "操作",
    key: "actions",
    width: 80,
    render(row: any) {
      return h(
        "button",
        {
          class: "n-button n-button--small",
          onClick: () => {
            if (
              !scopeTargets.value.find(
                (t) => t.targetType === "USER" && t.targetId === row.id,
              )
            ) {
              scopeTargets.value.push({
                targetType: "USER",
                targetId: row.id,
                targetName: row.name || row.username,
              });
            }
          },
        },
        "添加",
      );
    },
  },
];
async function loadUsers() {
  userLoading.value = true;
  try {
    const res = await UserManagerApi.list({ page: 1, pageSize: 100 });
    userList.value = Array.isArray(res) ? res : (res as any)?.list || [];
  } catch {
    userList.value = [];
  } finally {
    userLoading.value = false;
  }
}

// 部门选择
const deptList = ref<any[]>([]);
const deptLoading = ref(false);
async function loadDepartments() {
  deptLoading.value = true;
  try {
    const res = await DepartmentApi.list({});
    deptList.value = Array.isArray(res) ? res : (res as any)?.list || [];
  } catch {
    deptList.value = [];
  } finally {
    deptLoading.value = false;
  }
}
function addDeptTarget(dept: any) {
  if (
    !scopeTargets.value.find(
      (t) => t.targetType === "DEPARTMENT" && t.targetId === dept.id,
    )
  ) {
    scopeTargets.value.push({
      targetType: "DEPARTMENT",
      targetId: dept.id,
      targetName: dept.name,
    });
  }
}
</script>

<template>
  <div class="system-page">
    <n-page-header :title="isUpdate ? '编辑公告' : '新增公告'" @back="goBack">
    </n-page-header>

    <n-form :model="formData" label-placement="top">
      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-form-item label="公告标题" required path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入公告标题" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="公告类型" required path="type">
            <n-select
              v-model:value="formData.type"
              :options="noticeTypeOptions" />
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-form-item label="发布范围" path="scopeType">
            <n-select
              v-model:value="formData.scopeType"
              :options="scopeTypeOptions" />
          </n-form-item>
        </n-gi>
        <n-gi v-if="formData.scopeType !== 'ALL'">
          <n-form-item label="范围目标">
            <div style="display: flex; flex-wrap: wrap; gap: 4px; width: 100%">
              <n-tag
                v-for="(t, i) in scopeTargets"
                :key="i"
                closable
                @close="removeTarget(i)">
                {{ t.targetName || `目标#${t.targetId}` }}
              </n-tag>
              <n-button size="tiny" @click="showScopeModal = true"
                >选择</n-button
              >
            </div>
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-form-item label="置顶">
            <n-switch v-model:value="formData.isPinned" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="强制阅读">
            <n-switch v-model:value="formData.isMandatory" />
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-form-item label="公告内容">
        <WangEditor v-model="formData.content" :height="400" />
      </n-form-item>
    </n-form>

    <!-- 选择范围目标弹窗 -->
    <n-modal
      v-model:show="showScopeModal"
      title="选择范围目标"
      :width="600"
      preset="card"
      :mask-closable="false"
      @close="showScopeModal = false">
      <template v-if="formData.scopeType === 'ROLE'">
        <n-button style="margin-bottom: 12px" @click="loadRoles"
          >加载角色列表</n-button
        >
        <n-data-table
          :columns="roleColumns"
          :data="roleList"
          :loading="roleLoading"
          :bordered="true"
          size="small" />
      </template>
      <template v-else-if="formData.scopeType === 'DEPARTMENT'">
        <n-button style="margin-bottom: 12px" @click="loadDepartments"
          >加载部门列表</n-button
        >
        <n-data-table
          :columns="[
            { title: '部门名称', key: 'name' },
            { title: '部门编码', key: 'code' },
            {
              title: '操作',
              key: 'actions',
              width: 80,
              render: (row: any) =>
                h(
                  'button',
                  {
                    class: 'n-button n-button--small',
                    onClick: () => addDeptTarget(row),
                  },
                  '添加',
                ),
            },
          ]"
          :data="deptList"
          :loading="deptLoading"
          :bordered="true"
          size="small" />
      </template>
      <template v-else-if="formData.scopeType === 'USER'">
        <n-button style="margin-bottom: 12px" @click="loadUsers"
          >加载用户列表</n-button
        >
        <n-data-table
          :columns="userColumns"
          :data="userList"
          :loading="userLoading"
          :bordered="true"
          size="small" />
      </template>
      <template #footer>
        <n-button @click="showScopeModal = false">关闭</n-button>
      </template>
    </n-modal>

    <n-space>
      <n-button @click="goBack">取消</n-button>
      <n-button :loading="loading" @click="handleSaveDraft">保存草稿 </n-button>
      <n-button type="primary" :loading="loading" @click="handlePublish"
        >保存并发布</n-button
      >
    </n-space>
  </div>
</template>

