import request from '@/utils/http/axios'

enum API {
  list = '/system/operation-log/list',
  detail = '/system/operation-log/detail',
  stats = '/system/operation-log/stats',
  delete = '/system/operation-log/delete',
  batchDelete = '/system/operation-log/batch-delete',
  clearExpired = '/system/operation-log/clear-expired',
}

export const OperationLogApi = {
  list: (params?: Api.PageParams) => request.get<Api.PaginatedData<System.OperationLog>>({ url: API.list, params }),
  detail: (id: number) => request.get<System.OperationLog>({ url: `${API.detail}/${id}` }),
  stats: () => request.get<{ total: number, today: number }>({ url: API.stats }),
  delete: (id: number) => request.delete<null>({ url: `${API.delete}/${id}` }),
  batchDelete: (ids: number[]) => request.post<null>({ url: API.batchDelete, data: { ids } }),
  clearExpired: (days: number = 90) => request.post<null>({ url: API.clearExpired, data: { days } }),
}
