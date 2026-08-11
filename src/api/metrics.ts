import request from '@/utils/http/axios'

enum API {
  events = '/metrics/events',
  stats = '/metrics/stats',
}

export const MetricsApi = {
  /** 前端事件列表(管理端查看) */
  getEvents: (params?: Api.PageParams & { type?: string, category?: string }) =>
    request.get<Api.PaginatedData<System.ClientEvent>>({ url: API.events, params }),

  getStats: () =>
    request.get<{ total: number, errors: number, pageviews: number, todayErrors: number }>({ url: API.stats }),
}
