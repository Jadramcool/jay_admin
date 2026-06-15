<template>
  <div>
    <n-page-header class="mb-4">
      <template #title>{{ isUpdate ? "编辑用户" : "新增用户" }}</template>
      <template #extra>
        <n-button @click="goBack" variant="text">返回</n-button>
      </template>
    </n-page-header>

    <n-card :bordered="false" embedded>
      <FormEdit
        @register="registerForm"
        @submit="handleSubmit"
        showResetButton
        :submit-button-text="isUpdate ? '更新' : '创建'" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UserManagerApi } from "@/api/system";
import { useUserSchema } from "./schema";
import { useForm } from "@/components/Form";

const route = useRoute();
const router = useRouter();

const userId = route.params.id as string | undefined;
const isUpdate = ref(!!userId);

const { editFormSchemas } = useUserSchema();

const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  schemas: editFormSchemas,
  showActionButtonGroup: true,
});

onMounted(async () => {
  if (isUpdate.value) {
    try {
      const detail = await UserManagerApi.detail(Number(userId));
      console.log("🚀 ~ detail:", detail);
      const formData = {
        ...detail,
        roleIds: detail.roles?.map((r: any) => r.id) || [],
      };
      setFieldsValue(formData);
    } catch {
      goBack();
    }
  }
});

async function handleSubmit(values: any) {
  try {
    if (isUpdate.value) {
      await UserManagerApi.update(values);
      window.$message?.success?.("更新成功");
    } else {
      await UserManagerApi.create(values);
      window.$message?.success?.("创建成功");
    }
    goBack();
  } catch {}
}

function goBack() {
  router.push("/system/user");
}
</script>

