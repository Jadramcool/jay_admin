import type { PropType } from 'vue'
import type { TableRequest } from './types'
import { NDataTable } from 'naive-ui'
import { TABLELAYOUT } from './const'

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
    type: Function as PropType<TableRequest<unknown>>,
    default: null,
  },
  filters: {
    type: Object as PropType<Record<string, unknown>>,
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
  // 树形数据加载完成后自动展开全部行（此前仅在 BasicTable 内部被读取，未声明为 prop，永远不生效）
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  headerNoWrap: {
    type: Boolean,
    default: true,
  },
  paginationFixedBottom: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: TABLELAYOUT.size,
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
}
