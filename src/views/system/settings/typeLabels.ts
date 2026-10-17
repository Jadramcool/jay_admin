/**
 * 设置项的展示文案(类型/来源/可见性)。
 *
 * 类型与来源来自后端注册表,这里只负责把枚举翻译成中文与标签配色,
 * 新增设置类型时在这两个映射里补一行即可。
 */

/** 值控件需要的声明元数据(注册表项与列表行都能满足) */
export interface ControlMeta {
  type: string
  min?: number
  max?: number
  dictCode?: string
  readonly?: boolean
  source?: 'default' | 'db' | 'env'
}

export const TYPE_TEXT: Record<string, string> = {
  'string': '字符串',
  'number': '数字',
  'boolean': '布尔值',
  'json': 'JSON',
  'string[]': '字符串数组',
  'color': '颜色',
  'url': '链接',
  'email': '邮箱',
  'select': '选项',
}

export const SOURCE_TEXT: Record<string, string> = {
  default: '默认值',
  db: '已修改',
  env: '环境变量',
}

export const SOURCE_TAG: Record<string, 'default' | 'warning' | 'info'> = {
  default: 'default',
  db: 'warning',
  env: 'info',
}

export const EXPOSE_TEXT: Record<string, string> = {
  public: '公开',
  admin: '后台',
  secret: '密钥',
}

export const EXPOSE_TAG: Record<string, 'success' | 'default' | 'error'> = {
  public: 'success',
  admin: 'default',
  secret: 'error',
}

/** 类型下拉(查询表单用) */
export const TYPE_OPTIONS = [
  { label: '全部', value: '' },
  ...Object.entries(TYPE_TEXT).map(([value, label]) => ({ label, value })),
]

/** 来源下拉(查询表单用) */
export const SOURCE_OPTIONS = [
  { label: '全部', value: '' },
  ...Object.entries(SOURCE_TEXT).map(([value, label]) => ({ label, value })),
]
