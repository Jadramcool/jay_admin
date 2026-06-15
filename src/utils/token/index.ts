/**
 * Token 工具模块
 * 统一管理 accessToken 与 refreshToken 的存取，便于在 axios 拦截器、路由守卫、登录登出等场景复用。
 */
import storage from "@/utils/storage";

/** accessToken 存储键（支持通过环境变量自定义，未配置时使用默认值） */
const TOKEN_KEY = import.meta.env.VITE_APP_TOKEN_KEY || "JDM_TOKEN";

/** refreshToken 存储键 */
const REFRESH_TOKEN_KEY = "JDM_REFRESH_TOKEN";

/**
 * 获取当前登录用户的 accessToken
 * @returns token 字符串，未登录时返回 null
 */
export function getToken(): string | null {
  return storage.get(TOKEN_KEY);
}

/**
 * 同时保存 accessToken 与 refreshToken
 * @param data 包含 accessToken 与 refreshToken 的对象
 */
export function setToken(data: {
  accessToken: string;
  refreshToken: string;
}): void {
  storage.set(TOKEN_KEY, data.accessToken);
  storage.set(REFRESH_TOKEN_KEY, data.refreshToken);
}

/**
 * 清除 accessToken 与 refreshToken（用于退出登录或 token 失效场景）
 */
export function removeToken(): void {
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
}

/**
 * 获取 refreshToken（用于 accessToken 过期时的静默续期）
 * @returns refreshToken 字符串，未登录时返回 null
 */
export function getRefreshToken(): string | null {
  return storage.get(REFRESH_TOKEN_KEY);
}

/**
 * 单独更新 refreshToken（一般在 accessToken 续期成功后调用）
 * @param token 新的 refreshToken
 */
export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token);
}

/**
 * 单独清除 refreshToken
 */
export function removeRefreshToken(): void {
  storage.remove(REFRESH_TOKEN_KEY);
}

