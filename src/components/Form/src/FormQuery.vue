<script setup lang="ts" name="FormQuery">
import { isArray, isFunction } from "@/utils";
import { merge } from "lodash-es";
import { useBaseForm } from "./hooks/useBaseForm";
import FormItem from "./components/FormItem.vue";
import type { FormActionType, FormSchema } from "./types";
import type { GridProps } from "naive-ui";

defineOptions({ name: "FormQuery" });

const props = defineProps({
  /** Schema 配置数组 */
  schemas: { type: Array as PropType<FormSchema[]>, default: () => [] },
  /** NGrid 配置 */
  gridProps: {
    type: Object as PropType<GridProps>,
    default: () => ({ "x-gap": 10 }),
  },
  /** 每个表单项的 NGi 默认配置 */
  giProps: { type: Object, default: null },
  /** 标签宽度 */
  labelWidth: { type: [Number, String], default: "auto" },
  /** 标签对齐 */
  labelAlign: { type: String, default: "right" },
  /** 标签位置 */
  labelPlacement: { type: String, default: "left" },
  /** 尺寸 */
  size: {
    type: String as PropType<"small" | "medium" | "large">,
    default: "medium",
  },
  /** 布局 */
  layout: { type: String, default: "inline" },
  /** 组件是否撑满 */
  isFull: { type: Boolean, default: true },
  /** 是否显示操作按钮组 */
  showActionButtonGroup: { type: Boolean, default: true },
  /** 是否显示提交按钮 */
  showSubmitButton: { type: Boolean, default: true },
  /** 是否显示重置按钮 */
  showResetButton: { type: Boolean, default: true },
  /** 提交按钮文字 */
  submitButtonText: { type: String, default: "查询" },
  /** 重置按钮文字 */
  resetButtonText: { type: String, default: "重置" },
  /** 自定义提交函数 */
  submitFunc: {
    type: Function as PropType<() => Promise<void>>,
    default: null,
  },
  /** 自定义重置函数 */
  resetFunc: { type: Function as PropType<() => Promise<void>>, default: null },
  /** 重置后是否自动提交 */
  submitOnReset: { type: Boolean, default: true },
  /** 重置后是否复位表格页码 */
  resetPageOnReset: { type: Boolean, default: true },
  /** 关联的表格 ref */
  tableRef: { type: Object as PropType<any>, default: null },
  /** 是否显示展开/收起按钮 */
  showAdvancedButton: { type: Boolean, default: true },
  /** 重置按钮额外配置 */
  resetButtonOptions: { type: Object, default: null },
  /** 提交按钮额外配置 */
  submitButtonOptions: { type: Object, default: null },
});

const emit = defineEmits<{
  register: [action: FormActionType];
  submit: [values: Recordable];
  reset: [values: Recordable];
}>();

const {
  formModel,
  formElRef,
  defaultFormModel,
  getProps,
  getSchema,
  getShow,
  componentPropsMap,
  getComponentProps,
  schemaRef,
  isUpdateDefault,
  componentInstances,
  setProps,
  setComponentRef,
  setFieldsValue: baseSetFieldsValue,
  resetFields: baseResetFields,
  validate,
  clearValidate,
  updateSchema: baseUpdateSchema,
  getComponentInstance,
} = useBaseForm(props);

// ---------- Query 特有状态 ----------

const gridCollapsed = shallowRef(false);
const isExpand = computed(() => !gridCollapsed.value);
const loadingSub = shallowRef(false);

// ---------- bind value — 剔除所有表单自有 props ----------

const getBindValue = computed(() => {
  const {
    schemas,
    gridProps,
    giProps,
    showActionButtonGroup,
    showSubmitButton,
    showResetButton,
    submitButtonText,
    resetButtonText,
    submitFunc,
    resetFunc,
    tableRef,
    submitOnReset,
    resetPageOnReset,
    showAdvancedButton,
    resetButtonOptions,
    submitButtonOptions,
    ...rest
  } = unref(getProps);
  return rest;
});

// ---------- grid ----------

const isInline = computed(() => unref(getProps).layout === "inline");

const getGrid = computed((): GridProps => {
  const { gridProps } = unref(getProps);
  return {
    ...gridProps,
    collapsed: isInline.value ? unref(gridCollapsed) : false,
    responsive: "screen",
  } as GridProps;
});

// ---------- 查询值格式化 ----------

function handleFormValues(values: Recordable) {
  if (typeof values !== "object") return {};
  const res: Recordable = {};
  for (const [key, originalValue] of Object.entries(values)) {
    if (
      key &&
      !(isArray(originalValue) && originalValue.length === 0) &&
      !isFunction(originalValue) &&
      originalValue !== null &&
      originalValue !== undefined
    ) {
      let value = originalValue;
      if (typeof value === "string") value = value.trim();
      res[key] = value;
    }
  }
  return res;
}

function handleFormatFormValues(values: Recordable, schemas: FormSchema[]) {
  const formatValues = handleFormValues(values);
  const newValues: Recordable = {};
  Object.entries(formatValues).forEach(([key, value]: any) => {
    const schema = schemas.find((s) => s.field === key);
    if (schema) {
      const newKey = schema.query
        ? `${schema.field}__${schema.query}`
        : schema.field;
      newValues[newKey] = value;
      formModel[key] = value;
      if (schema.component === "NDatePicker") {
        if (Array.isArray(value)) {
          newValues[key] = value.map((v: any) => new Date(v));
        } else {
          newValues[key] = new Date(value);
        }
      }
    }
  });
  return newValues;
}

// ---------- 表单操作 ----------

function getFieldsValue(): Recordable {
  const formEl = unref(formElRef);
  if (!formEl) return {};
  const schemas = unref(getSchema) || [];
  const formatFieldsValue =
    schemas.length > 0 &&
    isFunction(handleFormatFormValues) &&
    handleFormatFormValues(unref(formModel), schemas);
  return formatFieldsValue || toRaw(unref(formModel));
}

async function setFieldsValue(values: Recordable): Promise<void> {
  const schemas = unref(getSchema) || [];
  const fields = schemas.map((item) => item.field).filter(Boolean);
  Object.keys(values).forEach((key) => {
    if (fields.includes(key)) {
      formModel[key] = values[key];
    }
  });
}

function resetFields() {
  const {
    resetFunc: customReset,
    submitOnReset,
    resetPageOnReset,
    tableRef,
  } = unref(getProps);
  if (customReset && isFunction(customReset)) {
    customReset();
    return;
  }
  const defaultModel = unref(defaultFormModel) || {};
  Object.keys(formModel).forEach((key) => {
    formModel[key] = defaultModel[key] ?? null;
  });
  clearValidate();

  const fromValues = getFieldsValue();
  emit("reset", fromValues);

  if (submitOnReset) {
    emit("submit", fromValues);
  }
  if (resetPageOnReset && tableRef && unref(tableRef)) {
    const tableInstance = unref(tableRef);
    if (tableInstance && isFunction(tableInstance.setPagination)) {
      tableInstance.setPagination({ page: 1 });
      if (isFunction(tableInstance.reload)) {
        tableInstance.reload();
      }
    }
  }
}

async function handleSubmit() {
  const { submitFunc: customSubmit } = unref(getProps);
  if (customSubmit && isFunction(customSubmit)) {
    await customSubmit();
    return;
  }
  const formEl = unref(formElRef);
  if (!formEl) return;
  try {
    await validate();
    const values = getFieldsValue();
    emit("submit", values);
  } catch {
    /* validation failed */
  }
}

function unfoldToggle() {
  gridCollapsed.value = !gridCollapsed.value;
}

const submitBtnOptions = computed(() => ({
  size: props.size,
  type: "primary" as const,
  ...props.submitButtonOptions,
}));

const resetBtnOptions = computed(() => ({
  size: props.size,
  ...props.resetButtonOptions,
}));

// ---------- 对外 API ----------

const formAction: FormActionType = {
  getFieldsValue: getFieldsValue as <T = Recordable>() => T,
  setFieldsValue,
  setProps,
  resetFields,
  validate,
  validateFields: ((name?: string | string[]) => {
    return (unref(formElRef) as any)?.validate(
      (errors: any) => {
        if (errors) console.error(errors);
      },
      (rule: any) => {
        if (name && isArray(name)) return name.includes(rule?.key as string);
        return rule?.key === name;
      },
    );
  }) as any,
  clearValidate,
  submit: handleSubmit as any,
  updateSchema: baseUpdateSchema,
  getComponentInstance,
};

onMounted(() => {
  emit("register", formAction);
});

defineExpose(formAction);
</script>

<template>
  <NForm v-bind="getBindValue" :model="formModel" ref="formElRef">
    <NGrid v-bind="getGrid">
      <template v-for="schema in getSchema" :key="schema.field">
        <NGi v-bind="schema.giProps || getProps.giProps" v-if="getShow(schema)">
          <FormItem
            :schema="schema"
            v-model:form-model="formModel"
            :component-props-map="componentPropsMap"
            :is-full="getProps.isFull"
            @set-ref="setComponentRef" />
        </NGi>
      </template>
      <NGi
        v-if="showActionButtonGroup"
        :span="isInline ? undefined : 24"
        :suffix="isInline ? true : false">
        <n-space align="center" :justify="isInline ? 'end' : 'start'">
          <n-button
            v-if="showSubmitButton"
            v-bind="submitBtnOptions"
            :loading="loadingSub"
            @click="handleSubmit">
            {{ submitButtonText }}
          </n-button>
          <n-button
            v-if="showResetButton"
            v-bind="resetBtnOptions"
            @click="resetFields">
            {{ resetButtonText }}
          </n-button>
          <n-button
            v-if="isInline && showAdvancedButton && getSchema.length > 3"
            type="primary"
            text
            icon-placement="right"
            @click="unfoldToggle">
            {{ isExpand ? "收起" : "展开" }}
          </n-button>
        </n-space>
      </NGi>
    </NGrid>
  </NForm>
</template>

