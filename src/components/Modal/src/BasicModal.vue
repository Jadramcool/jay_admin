<script setup lang="ts" name="BasicModal">
import { merge } from "lodash-es";
import { NCard } from "naive-ui";
import { BasicModalFooter } from "./components";
import { basicProps, footerProps } from "./props";

defineOptions({ name: "BasicModal" });

const emit = defineEmits<{
  register: [instance: any, uuid: number];
  ok: [];
  close: [];
}>();

const props = defineProps(basicProps);
const propsRef = ref<Partial<any>>({});
const modalElRef = useTemplateRef<any>("modalElRef");
const showRef = shallowRef(false);

const modalInstance = {
  setModalProps,
  emitOpen: undefined as ((show: boolean, uid: number) => void) | undefined,
};
const instance = getCurrentInstance();
instance && emit("register", modalInstance, instance.uid);

/** 合并后的最终 props */
const resolvedProps = computed(() => {
  const merged = merge({}, props, unref(propsRef));
  return {
    ...merged,
    show: unref(showRef),
    "onUpdate:show": handleShow,
  } as Recordable;
});

/** 透传给 NModal 的 props（剔除仅 NCard/footer 使用的） */
const modalBindProps = computed(() => {
  const { width, height, loading, ...rest } = unref(resolvedProps) as any;
  return rest;
});

/** 透传给 Footer 的 props — 只取 footerProps 定义的字段 */
const footerBindProps = computed(() => {
  const r = unref(resolvedProps) as any;
  const fk = Object.keys(footerProps);
  const picked: Recordable = {};
  fk.forEach((k) => {
    picked[k] = r[k];
  });
  return picked;
});

const loading = computed(() => unref(resolvedProps).loading ?? false);

watch(
  () => showRef.value,
  (show) => {
    nextTick(() => {
      if (instance && modalInstance.emitOpen) {
        modalInstance.emitOpen(show, instance.uid);
      }
    });
  },
);

async function setModalProps(modalProps: Partial<any>): Promise<void> {
  propsRef.value = merge(unref(propsRef) || {}, modalProps);
  if (Reflect.has(modalProps, "show")) {
    showRef.value = !!modalProps.show;
  }
}

const handleOk = () => {
  emit("ok");
};
const handleShow = (show: boolean) => {
  showRef.value = show;
};

const handleClose = async () => {
  const { closeFunc } = unref(resolvedProps);
  if (closeFunc && typeof closeFunc === "function") {
    const res = await closeFunc();
    showRef.value = !res;
    return;
  }
  emit("close");
  showRef.value = false;
};

const cardWidthStyle = computed(() => {
  const w = unref(resolvedProps).width || "800px";
  console.log("🚀 ~ w:", w, typeof w);
  return typeof w === "number" ? w + "px" : w;
});

const cardHeightStyle = computed(() => {
  const h = unref(resolvedProps).height;
  if (!h) return undefined;
  return typeof h === "number" ? h + "px" : h;
});
</script>

<template>
  <NModal v-bind="modalBindProps" ref="modalElRef">
    <template #default="{ draggableClass }">
      <NCard
        :style="{ width: cardWidthStyle }"
        size="small"
        closable
        :segmented="true"
        :on-close="handleClose">
        <template #header>
          <div :class="draggableClass">
            {{ resolvedProps.title || "弹窗" }}
          </div>
        </template>
        <template #default>
          <n-spin :show="loading">
            <NScrollbar
              content-class="modal-content"
              :style="{ height: cardHeightStyle }">
              <slot />
            </NScrollbar>
          </n-spin>
        </template>
        <template #footer>
          <slot v-if="$slots.footer" name="footer" />
        </template>
        <template #action>
          <n-flex justify="end">
            <slot v-if="$slots.action" name="action" />
            <BasicModalFooter
              v-bind="footerBindProps"
              @ok="handleOk"
              @close="handleClose" />
          </n-flex>
        </template>
      </NCard>
    </template>
  </NModal>
</template>

<style scoped>
.modal-content {
  padding: 0 6px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

