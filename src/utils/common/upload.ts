/**
 * 将上传接口返回的相对路径解析为可访问的 URL
 * - 绝对路径 (http/https) → 直接返回
 * - 相对路径 → 优先使用 VITE_UPLOAD_BASE_URL，无则拼接 VITE_API_BASE_URL 的 origin
 */
export function resolveUploadUrl(url?: string | null): string {
  if (!url)
    return ''
  if (/^https?:\/\//i.test(url))
    return url
  if (!url.startsWith('/'))
    return url

  const uploadBase = import.meta.env.VITE_UPLOAD_BASE_URL as string | undefined
  if (uploadBase) {
    const base = uploadBase.replace(/\/+$/, '')
    return `${base}${url}`
  }

  // 如果 API 是相对路径（如 /api），说明同源，浏览器直接请求即可（由 proxy / nginx 处理）
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!apiBase || apiBase.startsWith('/'))
    return url

  // API 是完整 URL → 提取 origin 拼接到上传路径
  try {
    const origin = new URL(apiBase).origin
    return `${origin}${url}`
  }
  catch {
    return url
  }
}
