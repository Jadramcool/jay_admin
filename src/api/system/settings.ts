import request from '@/utils/http/axios'

/**
 * 系统设置接口。
 *
 * 设置项(默认值/类型/分组/可见性)声明在后端注册表,
 * `getSchema()` 返回的元数据用于**自动渲染**设置页 —— 新增设置项不用改前端。
 */
enum API {
  publicView = '/system/settings/public',
  schema = '/system/settings/schema',
  base = '/system/settings',
}

export const SettingsApi = {
  /** 公开设置白名单(匿名可读,登录页/布局品牌位;非关键请求,失败降级为默认文案) */
  getPublic: () =>
    request.get<Record<string, string>>({ url: API.publicView, silentFail: true }),

  /** 注册表元数据:分组 + 每项的控件类型/约束/默认值 */
  getSchema: () => request.get<System.SettingSchema>({ url: API.schema }),

  /** 设置列表(生效值/来源/版本/更新人) */
  list: (params?: { group?: string }) =>
    request.get<System.SettingView[]>({ url: API.base, params }),

  /** 修改设置(expectedVersion 用于乐观锁,冲突返回 409) */
  update: (key: string, data: Api.SettingUpdateParams) =>
    request.put<System.SettingView>({ url: `${API.base}/${key}`, data }),

  /** 重置为注册表默认值 */
  reset: (key: string, data: Api.SettingResetParams) =>
    request.post<System.SettingView>({ url: `${API.base}/${key}/reset`, data }),

  /** 回滚某次修改(恢复到该次修改前的值)，需要 system:setting:rollback */
  rollback: (key: string, data: Api.SettingRollbackParams) =>
    request.post<System.SettingView>({ url: `${API.base}/${key}/rollback`, data }),

  /** 变更历史 */
  history: (key: string, params?: Api.PageParams) =>
    request.get<Api.PaginatedData<System.SettingHistoryItem>>({
      url: `${API.base}/${key}/history`,
      params,
    }),
}
