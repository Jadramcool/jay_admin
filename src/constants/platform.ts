/**
 * 端（platform）常量
 *
 * 与后端 `src/common/constants/platform.ts` 保持一致：
 * 角色与菜单都属于某个端，登录时携带端标识，服务端只下发该端的角色与权限。
 */
export const PLATFORM_ADMIN = 'admin'
export const PLATFORM_APP = 'app'
export const PLATFORM_MP = 'mp'
export const PLATFORM_COMMON = 'common'

/** 默认端（管理端） */
export const DEFAULT_PLATFORM = PLATFORM_ADMIN

export interface PlatformOption {
  label: string
  value: string
}

export const platformOptions: PlatformOption[] = [
  { label: '管理端', value: PLATFORM_ADMIN },
  { label: 'App 端', value: PLATFORM_APP },
  { label: '小程序', value: PLATFORM_MP },
  { label: '通用', value: PLATFORM_COMMON },
]

/** 可作为角色归属/登录端的端（不含通用端） */
export const clientPlatformOptions = platformOptions.filter(
  option => option.value !== PLATFORM_COMMON,
)

export function platformLabel(value?: string | null): string {
  return platformOptions.find(option => option.value === value)?.label ?? (value || '-')
}

/**
 * 角色可配置权限的端集合：角色自身端 + 通用端
 *
 * 服务端会拒绝把其他端的菜单分配给该角色，界面按此提示可选范围。
 */
export function assignablePlatforms(rolePlatform?: string | null): string[] {
  const primary = rolePlatform || DEFAULT_PLATFORM
  return primary === PLATFORM_COMMON ? [PLATFORM_COMMON] : [primary, PLATFORM_COMMON]
}
