import request from '@/utils/http/axios'
import { getRefreshToken } from '@/utils/token'

enum API {
  login = '/auth/login',
  register = '/auth/register',
  refresh = '/auth/refresh',
  logout = '/auth/logout',
  captcha = '/auth/captcha',
  userInfo = '/auth/user/info',
  menu = '/auth/user/menu',
  updateUser = '/auth/user/update',
  checkPassword = '/auth/user/checkPassword',
  updatePassword = '/auth/user/updatePassword',
}

export const UserApi = {
  login: (data: Api.LoginParams) =>
    request.post<Api.LoginResult>({ url: API.login, data, skipAuth: true }),

  /** 获取登录图形验证码(非关键请求,失败由组件降级隐藏验证码,不弹全局错误) */
  getCaptcha: () =>
    request.get<{ enabled: boolean, captchaId?: string, image?: string }>({ url: API.captcha, skipAuth: true, silentFail: true }),

  register: (data: Api.RegisterParams) =>
    request.post<{ userId: number, username: string }>({
      url: API.register,
      data,
      skipAuth: true,
    }),

  refresh: (refreshToken: string) =>
    request.post<Api.RefreshResult>({
      url: API.refresh,
      data: { refreshToken } satisfies Api.RefreshTokenParams,
      skipAuth: true,
      skipDuplicate: true,
    }),

  logout: () => request.post<null>({
    url: API.logout,
    data: { refreshToken: getRefreshToken() },
    skipAuthRefresh: true,
    skipDuplicate: true,
  }),

  getUserInfo: () => request.get<Api.UserInfo>({ url: API.userInfo }),

  menuAPI: () => request.get<System.Menu[]>({ url: API.menu }),

  updateUser: (data: Api.UserProfileUpdate) =>
    request.put<null>({ url: API.updateUser, data }),

  checkPassword: (password: string) =>
    request.post<{ valid: boolean }>({
      url: API.checkPassword,
      data: { password } satisfies Api.CheckPasswordParams,
    }),

  updatePassword: (data: Api.UpdatePasswordParams) =>
    request.post<null>({ url: API.updatePassword, data }),
}
