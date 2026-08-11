import request from '@/utils/http/axios'

enum API {
  list = '/system/session/list',
  stats = '/system/session/stats',
  kick = '/system/session/kick',
  kickUser = '/system/session/kick-user',
}

export const SessionApi = {
  list: (params?: Api.PageParams) =>
    request.get<Api.PaginatedData<System.UserSession>>({ url: API.list, params }),

  stats: () =>
    request.get<{ online: number, total: number }>({ url: API.stats }),

  /** 强制下线指定会话 */
  kick: (id: number) =>
    request.post<{ kicked: number }>({ url: `${API.kick}/${id}` }),

  /** 强制下线用户全部会话 */
  kickUser: (userId: number) =>
    request.post<{ kicked: number }>({ url: `${API.kickUser}/${userId}` }),
}
