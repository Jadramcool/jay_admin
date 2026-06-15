import request from '@/utils/http/axios'

enum API {
  login = '/auth/login',
  register = '/auth/register',
  refresh = '/auth/refresh',
  logout = '/auth/logout',
  userInfo = '/auth/user/info',
  menu = '/auth/user/menu',
  updateUser = '/auth/user/update',
  checkPassword = '/auth/user/checkPassword',
  updatePassword = '/auth/user/updatePassword',
}

export const UserApi = {
  login: (data: Api.LoginParams) =>
    request.post<Api.LoginResult>({ url: API.login, data }),

  register: (data: Api.RegisterParams) =>
    request.post<{ userId: number, username: string }>({
      url: API.register,
      data,
    }),

  refresh: (refreshToken: string) =>
    request.post<Api.RefreshResult>({
      url: API.refresh,
      data: { refreshToken },
    }),

  logout: () => request.post({ url: API.logout }),

  getUserInfo: () => request.get<Api.UserInfo>({ url: API.userInfo }),

  menuAPI: () => request.get<System.Menu[]>({ url: API.menu }),

  updateUser: (data: any) => request.put({ url: API.updateUser, data }),

  checkPassword: (password: string) =>
    request.post({ url: API.checkPassword, data: { password } }),

  updatePassword: (data: { oldPassword: string, newPassword: string }) =>
    request.post({ url: API.updatePassword, data }),
}
