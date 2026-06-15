import { shallowRef } from "vue";
import type { DataTableBaseColumn } from "naive-ui";

const tableColumnTypes = ["selection", "expand"];

const SELECTION_KEY = "__selection__";
const EXPAND_KEY = "__expand__";

export const useColumns = (refProps: any) => {
  const columns = computed(() => unref(refProps).columns);

  const columnsRef: Ref<DataTableBaseColumn[]> = ref(unref(columns));

  const getColumnChecks = (
    columnsData: DataTableBaseColumn[],
  ): NaiveUI.TableColumnCheck[] => {
    return columnsData.reduce<NaiveUI.TableColumnCheck[]>((acc, column) => {
      if (column.type && tableColumnTypes.includes(column.type)) {
        if (column.type === "selection") {
          acc.push({ key: SELECTION_KEY, title: "勾选", checked: true });
        } else if (column.type === "expand") {
          acc.push({ key: EXPAND_KEY, title: "展开", checked: true });
        }
      } else if (!column.type) {
        acc.push({
          title: column.title as string,
          key: column.key as string,
          checked: true,
        });
      }
      return acc;
    }, []);
  };

  const columnChecks = shallowRef<NaiveUI.TableColumnCheck[]>(
    getColumnChecks(unref(columns)),
  );

  const defaultColumnChecks = computed(() => getColumnChecks(unref(columns)));

  function resetColumns() {
    columnChecks.value = defaultColumnChecks.value.map((c) => ({ ...c }));
  }

  watch(
    columnChecks,
    <T extends NaiveUI.TableColumnCheck>(newVal: T[]) => {
      try {
        columnsRef.value = newVal
          .filter((column: NaiveUI.TableColumnCheck) => column.checked)
          .map((item) => {
            const index = unref(columns).findIndex(
              (column: DataTableBaseColumn) => column.key === item.key,
            );
            return index !== -1 ? unref(columns)[index] : null;
          })
          .filter((column) => column !== null) as DataTableBaseColumn[];
      } catch (error) {
        console.error("Error updating columnsRef:", error);
      }
    },
    { deep: true },
  );

  return {
    columns,
    columnChecks,
    getColumns: columnsRef,
    getColumnChecks,
    resetColumns,
  };
};

