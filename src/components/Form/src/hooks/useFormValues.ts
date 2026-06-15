import { isArray, isFunction, isString } from '@/utils';
import { nextTick } from 'vue';
import type { FormSchema } from '../types/form';

interface UseFormValuesContext {
  defaultFormModel: Ref<any>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
}

/**
 * useFormValues — 表单值的格式化与默认值初始化
 *
 * 职责：
 *   1. initDefaultFormModel：遍历 schema，将 defaultValue 填入 formModel 与 defaultFormModel
 *   2. handleFormValues：过滤空值、trim 字符串
 *   3. handleFormatFormValues：为 field 附加 __in / __not_in 查询后缀，转换日期格式
 */
export const useFormValues = ({ defaultFormModel, getSchema, formModel }: UseFormValuesContext) => {
  /**
   * 过滤空值：移除 null / undefined / 空数组，并对字符串做 trim。
   * 这是 getFieldsValue 的第一步处理。
   */
  const handleFormValues = (values: Recordable) => {
    if (typeof values !== 'object') return {};

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
        if (isString(value)) value = value.trim();
        res[key] = value;
      }
    }
    return res;
  };

  /**
   * 格式化最终提交的值：
   *   - 如果 schema 定义了 query 字段（'in' / 'not_in'），
   *     将 key 改写为 field__in / field__not_in（后端约定）
   *   - NDatePicker 的值转为 Date 对象
   */
  const handleFormatFormValues = (values: Recordable, schemas: FormSchema[]) => {
    const formatValues = handleFormValues(values);
    const newValues: Recordable = {};
    Object.entries(formatValues).forEach(([key, value]: any) => {
      const schema = schemas.find((s) => s.field === key);
      if (schema) {
        const newKey = schema.query ? `${schema.field}__${schema.query}` : schema.field;
        newValues[newKey] = value;
        formModel[key] = value;

        if (schema.component === 'NDatePicker') {
          if (Array.isArray(value)) {
            newValues[key] = value.map((v: any) => new Date(v));
          } else {
            newValues[key] = new Date(value);
          }
        }
      }
    });
    return newValues;
  };

  /**
   * 初始化默认值：遍历 schema，将所有 defaultValue 同步到：
   *   - formModel（当前表单数据，响应式）
   *   - defaultFormModel（快照，用于重置时还原）
   * 只在 schema 首次加载时执行一次（由 BasicForm 的 watch 控制）。
   */
  const initDefaultFormModel = () => {
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
  };

  return { handleFormValues, handleFormatFormValues, initDefaultFormModel };
};
