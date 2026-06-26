import request from '@/utils/http/axios'

interface NoticeTargetInput {
  targetType: string
  targetId: number
}

interface NoticeCreatePayload {
  title: string
  type: string
  content?: string
  isPinned?: boolean
  isMandatory?: boolean
  scopeType: string
  scopeTargets?: NoticeTargetInput[]
  status: number
}

interface NoticeUpdatePayload extends NoticeCreatePayload {
  id: number
}

interface ResendResult {
  id: number
  resendCount: number
  message: string
}

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

  create: (data: NoticeCreatePayload) =>
    request.post<System.Notice>({ url: API.create, data }),

  update: (data: NoticeUpdatePayload) =>
    request.put<System.Notice>({ url: API.update, data }),

  delete: (id: number) =>
    request.put({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.put({ url: API.batchDelete, data: { ids } }),

  toggleStatus: (id: number) =>
    request.put({ url: `${API.toggleStatus}/${id}` }),

  togglePin: (id: number) =>
    request.put({ url: `${API.togglePin}/${id}` }),

  resend: (id: number) =>
    request.post<ResendResult>({ url: `${API.resend}/${id}` }),

  // 用户端接口
  getUnreadNotices: () =>
    request.get<{ noticeId: number; title: string; content?: string; type: string; isMandatory: boolean; isPinned: boolean; publishedAt?: string }[]>({ url: '/notice/user/unread' }),

  markNoticeRead: (id: number) =>
    request.put({ url: `/notice/user/read/${id}` }),

  // 获取公告接收人列表
  getReceivers: (id: number, status?: string, page?: number, pageSize?: number) =>
    request.get<{ list: any[]; pagination: { page: number; pageSize: number; total: number } }>({ url: `/notice/${id}/receivers`, params: { status, page, pageSize } }),
}
