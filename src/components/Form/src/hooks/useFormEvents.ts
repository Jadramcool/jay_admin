import { isArray, isFunction } from "@/utils";
import { merge, uniqBy } from "lodash-es";
import { nextTick } from "vue";
import type { FormActionType, FormSchema } from "../types/form";

declare type EmitType = (event: any, ...args: any[]) => void;

interface UseFormActionContext {
  emit: EmitType;
  getProps: ComputedRef<any>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  formElRef: Ref<Nullable<FormActionType>>;
  schemaRef: Ref<FormSchema[]>;
  defaultFormModel: Ref<any>;
  loadingSub: Ref<boolean>;
  handleFormatFormValues: (
    values: Recordable,
    schema: FormSchema[],
  ) => Recordable;
}

/**
 * useFormEvents — 表单事件处理（提交、重置、校验、更新 schema）
 *
 * 注意：这里操作的是 BasicForm 内部传入的 formModel（reactive 对象），
 * 所有修改会直接同步到模板。
 */
export const useFormEvents = ({
  emit,
  getProps,
  getSchema,
  formModel,
  formElRef,
  schemaRef,
  loadingSub,
  defaultFormModel,
  handleFormatFormValues,
}: UseFormActionContext) => {
  /** 校验整个表单（Naive UI validate） */
  async function validate() {
    return (unref(formElRef) as any)?.validate();
  }

  /** 清除校验状态 */
  function clearValidate() {
    (unref(formElRef) as any)?.restoreValidation();
  }

  /**
   * 校验指定字段（Naive UI 支持通过 filter 函数指定规则 key）。
   * 适用于提交前的局部校验。
   */
  function validateFields(
    fields: string | string[] | undefined,
  ): Promise<any> | undefined {
    return (unref(formElRef) as any)?.validate(
      (errors: any) => {
        if (errors) console.error(errors);
      },
      (rule: any) => {
        if (isArray(fields)) return fields.includes(rule?.key as string);
        return rule?.key === fields;
      },
    );
  }

  /**
   * 提交处理：
   *   1. 如果定义了 submitFunc（自定义提交函数），直接调用
   *   2. 否则 validate → emit('submit', values)
   */
  const handleSubmit = async (
    event?: Event,
  ): Promise<object | boolean | undefined> => {
    event?.preventDefault();
    loadingSub.value = true;

    const { submitFunc } = unref(getProps);
    if (submitFunc && isFunction(submitFunc)) {
      await submitFunc();
      return;
    }

    const formEl = unref(formElRef);
    if (!formEl) return false;

    try {
      await validate();
      const values = getFieldsValue();
      console.log("🚀 ~ handleSubmit ~ values:", values);
      loadingSub.value = false;
      emit("submit", values);
      return values;
    } catch (error: any) {
      loadingSub.value = false;
      console.error(error);
      return false;
    }
  };

  /**
   * 重置表单：
   *   1. 将 formModel 还原到 defaultFormModel（schema 的 defaultValue 快照）
   *   2. 清空校验
   *   3. emit('reset')
   *   4. 如果 submitOnReset，顺便触发 submit
   *   5. 如果 resetPageOnReset + tableRef，重置表格页码并 reload
   */
  const resetFields = async () => {
    const { submitOnReset, resetPageOnReset, tableRef } = unref(getProps);
    const formEl = unref(formElRef);
    if (!formEl) return;

    const defaultModel = unref(defaultFormModel) || {};
    Object.keys(formModel).forEach((key) => {
      formModel[key] = defaultModel[key] ?? null;
    });

    clearValidate();

    const fromValues = getFieldsValue();
    emit("reset", fromValues);

    await nextTick();

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
  };

  /**
   * 获取当前表单值：先通过 handleFormatFormValues 处理格式（query 后缀、日期转换），
   * 如果没有 schemas 则返回原始 formModel。
   */
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

  /**
   * 设置表单字段值：遍历传入的 values，只设置 schema 中存在 field。
   */
  async function setFieldsValue(values: Recordable): Promise<void> {
    const schemas = unref(getSchema) || [];
    const fields = schemas.map((item) => item.field).filter(Boolean);

    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (fields.includes(key)) {
        formModel[key] = value;
      }
    });
  }

  /**
   * 更新 schema 的 defaultValue 并立即设置到 formModel。
   * 用于编辑时回填数据。
   */
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

  /**
   * 动态更新 schema 配置：合并已有 schema 与传入的新配置，
   * 更新后写入 schemaRef（这使得 getSchema 优先从这里读取）。
   *
   * 用于：动态修改下拉选项、切换字段显示/隐藏、修改校验规则等。
   */
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

  return {
    getFieldsValue,
    handleSubmit,
    resetFields,
    validate,
    clearValidate,
    setFieldsValue,
    updateSchema,
    validateFields,
  };
};

