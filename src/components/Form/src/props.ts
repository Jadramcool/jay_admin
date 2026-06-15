import { NForm } from "naive-ui";
import type { GridItemProps, GridProps } from "naive-ui";
import type { PropType } from "vue";

export const formProps = {
  ...NForm.props,
  labelWidth: { type: [Number, String], default: "auto" },
  requireMarkPlacement: { type: String, default: "left" },
  schemas: { type: Array as PropType<any[]>, default: () => [] },
  layout: {
    type: String as PropType<"inline" | "vertical" | "horizontal">,
    default: "inline",
  },
  size: { type: String, default: "medium" },
  labelAlign: { type: String, default: "right" },
  labelPlacement: { type: String, default: "left" },
  isFull: { type: Boolean, default: true },
  showActionButtonGroup: { type: Boolean, default: true },
  showSubmitButton: { type: Boolean, default: true },
  showResetButton: { type: Boolean, default: true },
  submitButtonText: { type: String, default: "查询" },
  resetButtonText: { type: String, default: "重置" },
  submitFunc: {
    type: Function as PropType<() => Promise<void>>,
    default: null,
  },
  resetFunc: { type: Function as PropType<() => Promise<void>>, default: null },
  submitOnReset: { type: Boolean, default: true },
  resetPageOnReset: { type: Boolean, default: true },
  showAdvancedButton: { type: Boolean, default: true },
  resetButtonOptions: { type: Object as PropType<Recordable>, default: null },
  submitButtonOptions: { type: Object as PropType<Recordable>, default: null },
  tableRef: { type: Object as PropType<any>, default: null },
  gridProps: {
    type: Object as PropType<GridProps>,
    default: () => ({ "x-gap": 10 }),
  },
  giProps: { type: Object as PropType<GridItemProps>, default: null },
  baseGridStyle: { type: Object, default: null },
  collapsed: { type: Boolean, default: false },
  collapsedRows: { type: Number, default: 1 },
};

