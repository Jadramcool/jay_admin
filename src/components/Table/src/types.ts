import type { DataTableColumns, PaginationProps } from 'naive-ui'

export type TableRow = Record<string, unknown>

export type TableRequestParams = Api.PageParams & Record<string, unknown>

export type TableRequest<T = TableRow> = (
  params: TableRequestParams,
) => Promise<Api.PaginatedData<T> | T[]>

export interface TableProps<T = TableRow> {
  request?: TableRequest<T> | null
  pagination?: false | Partial<PaginationProps>
  filters?: Record<string, unknown>
  localPagination?: boolean
  autoLoad?: boolean
  columns?: DataTableColumns<T>
}

export interface TableExpose {
  reload: (options?: Partial<Api.PageParams>) => Promise<void>
  setPagination: (options: Partial<PaginationProps>) => void
}
