import type { DataTableColumn } from "naive-ui";
import { TABLELAYOUT } from "@/components/Table/src/const";

const tableColumnTypes = new Set(["selection", "expand"]);
const tableColumnsKey: Record<string, string> = {
  selection: "__selection__",
  expand: "__expand__",
};

export const columnsUtil = (
  schema: any,
  tableFields: string[],
): DataTableColumn[] => {
  const tableFieldsIndex: Record<string, number> = tableFields.reduce(
    (acc: Recordable, key, index) => {
      acc[key] = index;
      return acc;
    },
    {},
  );
  const { properties, setting = {} } = schema;
  return properties
    .filter(
      ({ key, table }: any) =>
        tableFields.includes(key) ||
        (table && tableColumnTypes.has(table.type)),
    )
    .map(({ key, label, table, ifShow }: any) => {
      const title = label
        ? typeof label === "string"
          ? label
          : label[0]
        : key;
      return {
        key:
          table && tableColumnTypes.has(table.type)
            ? tableColumnsKey[table.type]
            : key,
        title,
        ...(ifShow !== undefined ? { ifShow } : {}),
        align: table?.align || TABLELAYOUT.align,
        ...setting.table,
        ...table,
      } as DataTableColumn;
    })
    .sort((a: Recordable, b: Recordable) => {
      const indexA = tableFieldsIndex[a.key];
      const indexB = tableFieldsIndex[b.key];
      return indexA - indexB;
    });
};

export const formSchemaUtil = (schema: any, formFields: string[]) => {
  const { properties, setting } = schema;
  const formFieldsIndex: Record<string, number> = formFields.reduce(
    (acc: Recordable, key, index) => {
      acc[key] = index;
      return acc;
    },
    {},
  );
  const result = properties
    .filter(
      ({ key, form }: any) =>
        formFields.includes(key) && form?.visible !== false,
    )
    .map(({ key, label, defaultValue, form, ifShow }: any) => ({
      field: form?.key || key,
      label,
      ...(ifShow !== undefined ? { ifShow } : {}),
      defaultValue: form?.defaultValue ?? defaultValue,
      ...(setting?.form || {}),
      ...form,
    }));
  return result.sort((a: Recordable, b: Recordable) => {
    const indexA = formFieldsIndex[a.field];
    const indexB = formFieldsIndex[b.field];
    return indexA - indexB;
  });
};

export const editFormSchemaUtil = (schema: any, editFormFields: string[]) => {
  const { properties, setting } = schema;
  const editFormFieldsIndex: Record<string, number> = editFormFields.reduce(
    (acc: Recordable, key, index) => {
      acc[key] = index;
      return acc;
    },
    {},
  );
  const result = properties
    .filter(
      ({ key, editForm }: any) =>
        editFormFields.includes(key) && editForm?.visible !== false,
    )
    .map(({ key, label, defaultValue, form, editForm, ifShow }: any) => {
      const fieldConfig = {
        field: editForm?.key || form?.key || key,
        label,
        ...(ifShow !== undefined ? { ifShow } : {}),
        defaultValue: editForm?.defaultValue ?? defaultValue,
        ...(setting?.form || {}),
        ...(form || {}),
        ...editForm,
      };
      delete fieldConfig.query;
      return fieldConfig;
    });
  return result.sort((a: Recordable, b: Recordable) => {
    const indexA = editFormFieldsIndex[a.field];
    const indexB = editFormFieldsIndex[b.field];
    return indexA - indexB;
  });
};

export const descriptionSchemaUtil = (
  schema: any,
  descriptionFields: string[],
) => {
  const { properties } = schema;
  const fieldsIndex: Record<string, number> = descriptionFields.reduce(
    (acc: Recordable, key, index) => {
      acc[key] = index;
      return acc;
    },
    {},
  );
  const result = properties
    .filter(({ key }: any) => descriptionFields.includes(key))
    .map(({ key, label, defaultValue, description, table }: any) => ({
      field: key,
      label,
      defaultValue: description?.defaultValue ?? defaultValue,
      ...description,
      render: description?.render || table?.render || null,
    }));
  return result.sort((a: Recordable, b: Recordable) => {
    const indexA = fieldsIndex[a.field];
    const indexB = fieldsIndex[b.field];
    return indexA - indexB;
  });
};

