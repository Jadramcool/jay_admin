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
  list: (params?: any) => request.get({ url: API.list, params }),
  detail: (id: number) => request.get({ url: `${API.detail}/${id}` }),
  stats: () => request.get({ url: API.stats }),
  delete: (id: number) => request.delete({ url: `${API.delete}/${id}` }),
  batchDelete: (ids: number[]) => request.post({ url: API.batchDelete, data: { ids } }),
  clearExpired: (days: number = 90) => request.post({ url: API.clearExpired, data: { days } }),
}
