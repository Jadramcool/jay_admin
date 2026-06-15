import { isArray, isBoolean, isFunction } from "@/utils";
import { merge, uniqBy } from "lodash-es";
import { createPlaceholderMessage } from "../helper";
import type { FormActionType, FormSchema } from "../types";

/**
 * useBaseForm — 表单核心逻辑基座
 *
 * 提供 FormQuery / FormEdit 共享的：
 * - 响应式状态（formModel / schemaRef / propsRef …）
 * - schema 渲染辅助（getSchema / getShow / componentPropsMap）
 * - 基础操作（validate / setFieldsValue / resetFields / updateSchema）
 * - 默认值初始化
 */
export function useBaseForm(props: any) {
  const defaultFormModel = shallowRef<Recordable>({});
  const formModel = reactive<Recordable>({});
  const formElRef = shallowRef<Nullable<FormActionType>>(null);
  const propsRef = shallowRef<Partial<any>>({});
  const schemaRef = shallowRef<Nullable<FormSchema[]>>(null);
  const isUpdateDefault = shallowRef(false);
  const componentInstances: Recordable = {};

  // ---------- Computed ----------

  const getProps = computed((): any => {
    const formProps = merge({}, props, unref(propsRef));
    const rulesObj: Recordable = { rules: {} };
    const schemas: FormSchema[] = formProps.schemas || [];
    schemas.forEach((item) => {
      if (item.rules && isArray(item.rules)) {
        (item.rules as any[]).forEach((rule: any) => {
          rule.key = item.field;
        });
        rulesObj.rules[item.field] = item.rules;
      }
    });
    return { ...formProps, ...rulesObj };
  });

  const getSchema = computed((): FormSchema[] => {
    return unref(schemaRef) || (unref(getProps).schemas as any) || [];
  });

  const getShow = (schema: FormSchema): boolean => {
    const { ifShow } = schema;
    if (ifShow === undefined) return true;
    if (isBoolean(ifShow)) return ifShow;
    if (isFunction(ifShow)) {
      return ifShow({ values: { ...formModel }, schema });
    }
    return true;
  };

  /** 预计算每个 schema 的 componentProps */
  const componentPropsMap = computed(() => {
    const schemaArray = unref(getSchema) || [];
    return schemaArray.reduce((acc, schema: any) => {
      const compProps = getComponentProps(schema);
      if (compProps !== undefined && typeof compProps === "object") {
        acc[schema.field] = compProps;
      }
      return acc;
    }, {} as Recordable);
  });

  function getComponentProps(schema: FormSchema): Recordable {
    let { componentProps = {} } = schema;
    if (isFunction(componentProps)) {
      componentProps = componentProps({ schema, formModel }) ?? {};
    }

    const defaultComponentProps: Recordable = {
      placeholder: createPlaceholderMessage(schema.component),
    };

    if (
      schema.component === "NSelect" ||
      schema.component === "NInput" ||
      schema.component === "NDatePicker" ||
      schema.component === "NTimePicker" ||
      schema.component === "ApiSelect"
    ) {
      if (!Reflect.has(componentProps, "clearable")) {
        defaultComponentProps.clearable = true;
      }
    }

    return { ...defaultComponentProps, ...componentProps };
  }

  // ---------- 状态更新 ----------

  function setComponentRef(field: string, el: any) {
    if (el) componentInstances[field] = el;
  }

  async function setProps(formProps: Partial<any>): Promise<void> {
    propsRef.value = merge({}, unref(propsRef) || {}, formProps);
  }

  // ---------- 基础操作 ----------

  async function validate() {
    return (unref(formElRef) as any)?.validate();
  }

  function clearValidate() {
    (unref(formElRef) as any)?.restoreValidation();
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
    const defaultModel = unref(defaultFormModel) || {};
    Object.keys(formModel).forEach((key) => {
      formModel[key] = defaultModel[key] ?? null;
    });
    clearValidate();
  }

  async function updateSchema(
    data: Partial<FormSchema> | Partial<FormSchema>[],
  ) {
    let updateData: Partial<FormSchema>[] = [];
    if (isArray(data)) {
      updateData = [...data];
    } else {
      updateData.push(data);
    }

    const hasField = updateData.every(
      (item) => Reflect.has(item, "field") && item.field,
    );
    if (!hasField) {
      console.error("所有需要更新的schema必须包含field字段");
      return;
    }

    const schema: FormSchema[] = [];
    const updatedSchema: FormSchema[] = [];
    unref(getSchema).forEach((val) => {
      const updatedItem = updateData.find((item) => val.field === item.field);
      if (updatedItem) {
        const newSchema = merge({}, val, updatedItem) as FormSchema;
        updatedSchema.push(newSchema);
        schema.push(newSchema);
      } else {
        schema.push(val);
      }
    });

    await setDefaultValue(updatedSchema);
    schemaRef.value = uniqBy(schema, "field");
  }

  async function setDefaultValue(data: FormSchema | FormSchema[]) {
    let schemas: FormSchema[] = [];
    if (isArray(data)) {
      schemas = [...data];
    } else {
      schemas.push(data);
    }
    const obj: Recordable = {};
    schemas.forEach((item) => {
      if (
        Reflect.has(item, "field") &&
        item.field &&
        item.defaultValue !== null &&
        item.defaultValue !== undefined
      ) {
        obj[item.field] = item.defaultValue;
      }
    });
    await setFieldsValue(obj);
  }

  const getComponentInstance = (field: string) => componentInstances[field];

  // ---------- 默认值初始化 ----------

  function initDefaultFormModel() {
    const schemas = unref(getSchema);
    const defaultForm: Recordable = {};
    schemas.forEach((schema) => {
      const { defaultValue } = schema;
      if (defaultValue !== null && defaultValue !== undefined) {
        defaultForm[schema.field] = defaultValue;
        formModel[schema.field] = defaultValue;
      }
    });
    defaultFormModel.value = defaultForm;
  }

  watch(
    () => unref(getSchema),
    (schema: FormSchema[]) => {
      if (!unref(isUpdateDefault) && schema?.length) {
        initDefaultFormModel();
        isUpdateDefault.value = true;
      }
    },
  );

  return {
    // 状态
    formModel,
    formElRef,
    defaultFormModel,
    propsRef,
    schemaRef,
    isUpdateDefault,
    componentInstances,
    // computed
    getProps,
    getSchema,
    getShow,
    componentPropsMap,
    getComponentProps,
    // 方法
    setProps,
    setComponentRef,
    setFieldsValue,
    resetFields,
    validate,
    clearValidate,
    updateSchema,
    getComponentInstance,
  };
}

