import { NDataTable } from "naive-ui";
import type { PropType } from "vue";
import { TABLELAYOUT } from "./const";

export const basicProps = {
  ...NDataTable.props,
  title: {
    type: String,
    default: undefined,
  },
  columns: {
    type: [Array] as PropType<any[]>,
    default: () => [],
    required: true,
  },
  request: {
    type: Function as PropType<(...arg: any[]) => Promise<any>>,
    default: null,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  rowKey: {
    type: [String, Function] as PropType<string | ((row: any) => string)>,
    default: undefined,
  },
  pagination: {
    type: [Object, Boolean],
    default: () => ({}),
  },
  showAddBtn: {
    type: Boolean,
    default: true,
  },
  showBatchDeleteBtn: {
    type: Boolean,
    default: false,
  },
  showColumnsSetting: {
    type: Boolean,
    default: true,
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  localPagination: {
    type: Boolean,
    default: false,
  },
  headerNoWrap: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String as PropType<"small" | "medium" | "large">,
    default: TABLELAYOUT.size,
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
};

