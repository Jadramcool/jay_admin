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

/**
 * 当前启用的端：界面上的端切换（菜单管理、角色权限分配）只展示这些
 *
 * 后端已支持 admin/app/mp/common，启用新端时在这里登记（与后端
 * src/common/constants/platform.ts 保持同名常量），界面无需改动。
 * 通用端（common）不是登录端，而是"多端共享"的权限池：菜单管理里可维护
 * 通用菜单，角色的所属端也可以选通用（该角色的权限在所有端都生效）。
 */
export const enabledPlatforms: string[] = [
  PLATFORM_ADMIN,
  PLATFORM_APP,
  PLATFORM_COMMON,
]

export const enabledPlatformOptions = platformOptions.filter(option =>
  enabledPlatforms.includes(option.value),
)

/** 角色「所属端」选项：通用端角色在所有端生效 */
export const rolePlatformOptions: PlatformOption[] = enabledPlatformOptions.map(
  option =>
    option.value === PLATFORM_COMMON
      ? { ...option, label: '通用（全端生效）' }
      : option,
)

export function platformLabel(value?: string | null): string {
  return platformOptions.find(option => option.value === value)?.label ?? (value || '-')
}

/**
 * 角色可配置权限的端集合
 *
 * - 普通角色（属于某个具体端）：本端 + 通用端
 * - 通用角色（端为 common）：在所有端都生效，可配置所有端 + 通用端
 *
 * 服务端 `configurablePlatforms` 使用同一规则校验，界面据此渲染端 Tab。
 */
export function configurablePlatforms(rolePlatform?: string | null): string[] {
  if ((rolePlatform || DEFAULT_PLATFORM) === PLATFORM_COMMON)
    return [...enabledPlatforms]

  return [rolePlatform || DEFAULT_PLATFORM, PLATFORM_COMMON]
}
