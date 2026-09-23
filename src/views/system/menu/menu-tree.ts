/**
 * 菜单树工具
 *
 * 菜单树同时承载两个投影：
 * - 导航层 DIRECTORY / MENU：侧边栏与动态路由
 * - 权限层 BUTTON：一个按钮即一个接口权限码
 *
 * 这里的规则与后端 `menu-type.rules.ts` 保持一致：前端负责交互层防呆
 * （pid 候选只列出合法父级），后端负责最终校验（直接调接口也造不出非法树）。
 */

export type MenuTypeValue = System.Menu['type']

export const MENU_TYPE_LABEL: Record<MenuTypeValue, string> = {
  DIRECTORY: '目录',
  MENU: '菜单',
  BUTTON: '按钮',
}

export interface MenuTypeRule {
  /** 是否允许作为根节点（不选父级） */
  allowRoot: boolean
  /** 允许的父节点类型 */
  parentTypes: MenuTypeValue[]
}

export const MENU_PARENT_RULES: Record<MenuTypeValue, MenuTypeRule> = {
  DIRECTORY: { allowRoot: true, parentTypes: ['DIRECTORY'] },
  MENU: { allowRoot: true, parentTypes: ['DIRECTORY'] },
  // 按钮的宿主可以是页面（页面级操作）或目录（模块级操作），与后端规则一致
  BUTTON: { allowRoot: false, parentTypes: ['DIRECTORY', 'MENU'] },
}

export interface MenuParentOption extends Omit<System.Menu, 'children'> {
  disabled?: boolean
  children?: MenuParentOption[]
}

export interface MenuTreeFilters {
  /** 名称 / 路由标识 / 权限码 模糊匹配 */
  keyword?: string | null
  /** 节点类型 */
  type?: MenuTypeValue | null
  /** 启用状态（对应后端 enable 字段，同时是鉴权过滤条件） */
  status?: 'enabled' | 'disabled' | null
}

/**
 * 构建「父级菜单」候选树
 *
 * - 剔除自身及其子树，避免把节点挂到自己的后代下（成环）
 * - 不满足类型约束的节点标记为 disabled（保留层级以便导航，但不能选中）
 */
export function buildParentOptions(
  nodes: System.Menu[],
  type: MenuTypeValue,
  selfId?: number | null,
): MenuParentOption[] {
  const rule = MENU_PARENT_RULES[type]

  const walk = (list: System.Menu[]): MenuParentOption[] => {
    const result: MenuParentOption[] = []

    for (const node of list) {
      if (selfId != null && node.id === selfId)
        continue

      const children = walk(node.children ?? [])
      const option: MenuParentOption = {
        ...node,
        disabled: !rule.parentTypes.includes(node.type),
      }

      if (children.length > 0)
        option.children = children
      else
        delete option.children

      result.push(option)
    }

    return result
  }

  return walk(nodes)
}

/**
 * 本地过滤菜单树
 *
 * 命中子节点时保留其祖先链，避免结果里出现"找不到父亲"的裸节点；
 * 祖先本身不参与匹配，只作为上下文保留。
 */
export function filterMenuTree(
  nodes: System.Menu[],
  filters: MenuTreeFilters = {},
): System.Menu[] {
  const keyword = (filters.keyword ?? '').trim().toLowerCase()
  const type = filters.type ?? null
  const status = filters.status ?? null

  if (!keyword && !type && !status)
    return nodes

  const isMatch = (node: System.Menu): boolean => {
    const matchesKeyword = !keyword
      || `${node.name} ${node.code} ${node.permission ?? ''}`
        .toLowerCase()
        .includes(keyword)
    const matchesType = !type || node.type === type
    const matchesStatus = !status
      || (status === 'enabled' ? node.enable !== false : node.enable === false)

    return matchesKeyword && matchesType && matchesStatus
  }

  const walk = (list: System.Menu[]): System.Menu[] => {
    const result: System.Menu[] = []

    for (const node of list) {
      const children = walk(node.children ?? [])
      if (!isMatch(node) && children.length === 0)
        continue

      const next: System.Menu = { ...node }
      if (children.length > 0)
        next.children = children
      else
        delete next.children

      result.push(next)
    }

    return result
  }

  return walk(nodes)
}

/** 各类型节点可提交的字段，其余字段在提交前裁掉 */
export const MENU_TYPE_FIELDS: Record<MenuTypeValue, string[]> = {
  DIRECTORY: [
    'name',
    'code',
    'pid',
    'path',
    'icon',
    'redirect',
    'order',
    'show',
    'enable',
    'alwaysShow',
    'target',
    'isFrame',
    'frameSrc',
    'needLogin',
    'description',
    'badge',
    'badgeType',
  ],
  MENU: [
    'name',
    'code',
    'pid',
    'path',
    'component',
    'icon',
    'redirect',
    'order',
    'show',
    'enable',
    'keepAlive',
    'affix',
    'target',
    'isFrame',
    'frameSrc',
    'needLogin',
    'description',
    'badge',
    'badgeType',
    'layout',
  ],
  BUTTON: ['name', 'code', 'pid', 'permission', 'order', 'enable', 'description'],
}

/** 类型不适用时显式置 null 的可空字段；其余不适用字段直接省略，交给库默认值 */
const NULLABLE_MENU_FIELDS = new Set([
  'path',
  'component',
  'icon',
  'redirect',
  'frameSrc',
  'permission',
  'badge',
  'badgeType',
])

/**
 * 按节点类型裁剪提交负载
 *
 * 新增/编辑共用一套表单，切换类型只是把字段隐藏，被隐藏字段的值仍留在表单模型里。
 * 整包提交会把容器字段写进按钮行（layout/target/affix 等），也会让目录行残留 component。
 * 这里按类型白名单裁剪，并对可空字段显式置 null，保证落库数据与节点类型一致。
 *
 * 按钮的路由标识与权限码强制同源（种子数据与历史迁移数据均满足 code === permission），
 * 避免同一个权限码在 code / permission 两处各写一遍而对不上。
 */
export function buildMenuPayload(
  values: Record<string, any>,
  type: MenuTypeValue,
): Record<string, any> {
  const allowed = new Set(MENU_TYPE_FIELDS[type])
  const payload: Record<string, any> = {}

  if (values.id !== undefined && values.id !== null)
    payload.id = values.id

  for (const [key, value] of Object.entries(values)) {
    if (key === 'id' || key === 'type' || key === 'withContentCard')
      continue
    if (allowed.has(key))
      payload[key] = value
    else if (NULLABLE_MENU_FIELDS.has(key))
      payload[key] = null
  }

  payload.type = type

  if (type === 'BUTTON') {
    const permission = String(values.permission ?? '').trim()
    if (permission)
      payload.code = permission
  }

  return payload
}
