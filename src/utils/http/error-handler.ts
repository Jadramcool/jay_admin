/**
 * 全局错误处理器
 * 统一接管后端返回的错误信息，默认展示后端 message
 */
import type { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code?: number;
  status?: number;
}

function extractMessage(err: unknown): string {
  if (typeof err === "string") return err;

  // AxiosError with response (HTTP 非 401)
  const axiosErr = err as AxiosError<{ message?: string }>;
  if (axiosErr?.response?.data?.message) {
    return axiosErr.response.data.message;
  }

  // Business error rejected by response interceptor (new Error(message)) 或手动 reject 的 ApiError
  const apiErr = err as ApiError;
  if (apiErr.message) return apiErr.message;

  return "网络错误";
}

/**
 * 默认错误处理：弹 toast 展示后端错误消息
 * 组件 catch 中可直接调用，无需重复写 toast
 *
 * @example
 *   try { ... } catch (err) { errorHandler(err) }
 *   // 等价于 window.$message?.error?.(后端返回的message)
 */
export function errorHandler(err: unknown): void {
  const msg = extractMessage(err);
  window.$message?.error?.(msg);
}
