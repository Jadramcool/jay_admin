import request from '@/utils/http/axios'

enum API {
  list = '/system/permission/list',
}

export const PermissionApi = {
  /** 获取功能权限列表（按模块分组） */
  list: () => request.get<System.PermissionGroup[]>({ url: API.list }),
}
