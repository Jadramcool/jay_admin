import request from '@/utils/http/axios'

enum API {
  list = '/notice/list',
  detail = '/notice',
  create = '/notice/create',
  update = '/notice/update',
  delete = '/notice/delete',
  batchDelete = '/notice/batchDelete',
  toggleStatus = '/notice/status',
  togglePin = '/notice/pin',
  resend = '/notice/resend',
}

export const NoticeApi = {
  list: (params?: Api.PageParams) =>
    request.get<Api.PaginatedList<System.Notice>>({ url: API.list, params }),

  detail: (id: number) =>
    request.get<System.Notice>({ url: `${API.detail}/${id}` }),

  create: (data: Partial<System.Notice> & { scopeTargets?: { targetType: string; targetId: number }[] }) =>
    request.post({ url: API.create, data }),

  update: (data: Partial<System.Notice> & { id: number; scopeTargets?: { targetType: string; targetId: number }[] }) =>
    request.put({ url: API.update, data }),

  delete: (id: number) =>
    request.put({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.put({ url: API.batchDelete, data: { ids } }),

  toggleStatus: (id: number) =>
    request.put({ url: `${API.toggleStatus}/${id}` }),

  togglePin: (id: number) =>
    request.put({ url: `${API.togglePin}/${id}` }),

  resend: (id: number) =>
    request.post({ url: `${API.resend}/${id}` }),
}
