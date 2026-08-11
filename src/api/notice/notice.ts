import request from '@/utils/http/axios'

interface NoticeTargetInput {
  targetType: System.NoticeTargetType
  targetId: number
}

interface NoticeCreatePayload {
  title: string
  type: System.NoticeType
  content?: string
  isPinned?: boolean
  isMandatory?: boolean
  scopeType: System.NoticeScopeType
  scopeTargets?: NoticeTargetInput[]
  status: System.BinaryStatus
}

interface NoticeUpdatePayload extends NoticeCreatePayload {
  id: number
}

interface ResendResult {
  id: number
  resendCount: number
  message: string
}

export interface NoticeReceiver extends System.User {
  readAt?: string
  readStatus?: System.NoticeReadStatus
  userId: number
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
    request.get<Api.PaginatedData<System.Notice>>({ url: API.list, params }),

  detail: (id: number) =>
    request.get<System.Notice>({ url: `${API.detail}/${id}` }),

  create: (data: NoticeCreatePayload) =>
    request.post<System.Notice>({ url: API.create, data }),

  update: (data: NoticeUpdatePayload) =>
    request.put<System.Notice>({ url: API.update, data }),

  delete: (id: number) =>
    request.put<null>({ url: `${API.delete}/${id}` }),

  batchDelete: (ids: number[]) =>
    request.put<null>({ url: API.batchDelete, data: { ids } }),

  toggleStatus: (id: number) =>
    request.put<null>({ url: `${API.toggleStatus}/${id}` }),

  togglePin: (id: number) =>
    request.put<null>({ url: `${API.togglePin}/${id}` }),

  resend: (id: number) =>
    request.post<ResendResult>({ url: `${API.resend}/${id}` }),

  // 用户端接口
  getUnreadNotices: () =>
    request.get<Api.NoticePushEvent[]>({ url: '/notice/user/unread' }),

  markNoticeRead: (id: number) =>
    request.put<null>({ url: `/notice/user/read/${id}` }),

  // 获取公告接收人列表
  getReceivers: (id: number, status?: System.NoticeReadStatus, page?: number, pageSize?: number) =>
    request.get<Api.PaginatedData<NoticeReceiver>>({ url: `/notice/${id}/receivers`, params: { readStatus: status, page, pageSize } }),
}
