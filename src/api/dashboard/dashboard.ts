import request from '@/utils/http/axios'

enum API {
  stats = '/dashboard/stats',
  trends = '/dashboard/trends',
  mine = '/dashboard/mine',
  systemInfo = '/dashboard/system-info',
  activities = '/dashboard/activities',
}

export const DashboardApi = {
  stats: () => request.get<Dashboard.Stats>({ url: API.stats }),
  trends: (days: number = 7) =>
    request.get<Dashboard.Trends>({ url: API.trends, params: { days } }),
  /** 个人工作台聚合数据(待办/公告/我的动态,单请求) */
  mine: () => request.get<Dashboard.MineInfo>({ url: API.mine }),
  systemInfo: () =>
    request.get<Dashboard.SystemInfo>({ url: API.systemInfo }),
  activities: (limit: number = 10) =>
    request.get<Dashboard.Activity[]>({ url: API.activities, params: { limit } }),
}
