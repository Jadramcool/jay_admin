import type { ButtonProps } from 'naive-ui'
import { NButton, NDivider, NPopconfirm } from 'naive-ui'
import { Fragment } from 'vue'

export interface TableActionItem {
  /** 按钮文字 */
  label: string
  /** 语义色，缺省为灰色文字 */
  type?: ButtonProps['type']
  /** 点击回调；配置 confirm 时作为确认后的回调 */
  onClick?: () => void
  /** 是否显示，默认 true（用于权限/状态控制） */
  show?: boolean
  /** 传入文案时用 NPopconfirm 二次确认 */
  confirm?: string
}

/** 表格操作列：文字按钮 + 竖向分隔线，自动跳过隐藏项之间的分隔线 */
export function renderTableActions(actions: TableActionItem[]) {
  const visible = actions.filter(action => action.show !== false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {visible.map((action, index) => {
        const button = action.confirm
          ? (
              <NPopconfirm onPositiveClick={action.onClick}>
                {{
                  trigger: () => (
                    <NButton text size="small" type={action.type}>
                      {action.label}
                    </NButton>
                  ),
                  default: () => action.confirm,
                }}
              </NPopconfirm>
            )
          : (
              <NButton text size="small" type={action.type} onClick={action.onClick}>
                {action.label}
              </NButton>
            )
        return (
          <Fragment key={`${action.label}${index}`}>
            {index > 0 && <NDivider vertical />}
            {button}
          </Fragment>
        )
      })}
    </div>
  )
}
