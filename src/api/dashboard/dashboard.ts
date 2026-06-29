import request from '@/utils/http/axios'

enum API {
  stats = '/dashboard/stats',
  trends = '/dashboard/trends',
  systemInfo = '/dashboard/system-info',
  activities = '/dashboard/activities',
}

export const DashboardApi = {
  stats: () => request.get<Dashboard.Stats>({ url: API.stats }),
  trends: (days: number = 7) =>
    request.get<Dashboard.Trends>({ url: API.trends, params: { days } }),
  systemInfo: () =>
    request.get<Dashboard.SystemInfo>({ url: API.systemInfo }),
  activities: (limit: number = 10) =>
    request.get<Dashboard.Activity[]>({ url: API.activities, params: { limit } }),
}
