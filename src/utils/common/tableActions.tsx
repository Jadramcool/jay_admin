import type { ButtonProps } from 'naive-ui'
import type { PropType } from 'vue'
import { NButton, NDivider, NPopconfirm } from 'naive-ui'
import { computed, defineComponent, Fragment, ref } from 'vue'

export interface TableActionItem {
  /** 按钮文字 */
  label: string
  /** 语义色，缺省为灰色文字 */
  type?: ButtonProps['type']
  /**
   * 点击回调；配置 confirm 时作为确认后的回调。
   * 返回 Promise 时，确认按钮自动进入 loading，直到其结束才关闭确认框（同时阻止连点）。
   */
  onClick?: () => void | Promise<void>
  /** 是否显示，默认 true（用于权限控制） */
  show?: boolean
  /** 是否禁用：可见但不可点击（用于状态控制，如"当前会话不能下线"） */
  disabled?: boolean
  /** 传入文案时用 NPopconfirm 二次确认 */
  confirm?: string
  /**
   * 手动控制确认按钮的加载态，覆盖由 Promise 推导的自动 loading。
   * 一般不需要：让 onClick 返回 Promise 即可。
   */
  confirmLoading?: boolean
}

/**
 * 确认分支：自带 loading 状态。
 * 状态放在组件内部而不是模块级，才能随行/重渲染正确复位。
 */
const ConfirmAction = defineComponent({
  name: 'TableConfirmAction',
  props: {
    label: { type: String, required: true },
    type: { type: String as PropType<ButtonProps['type']>, default: undefined },
    content: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    externalLoading: { type: Boolean, default: false },
    onClick: {
      type: Function as PropType<() => void | Promise<void>>,
      default: undefined,
    },
  },
  setup(props) {
    const pending = ref(false)
    const loading = computed(() => props.externalLoading || pending.value)

    async function handlePositive() {
      // loading 期间 NButton 已不派发 click，这里再兜一层防止并发入口
      if (loading.value)
        return false
      pending.value = true
      try {
        await props.onClick?.()
        return true
      }
      finally {
        pending.value = false
      }
    }

    return () => (
      <NPopconfirm
        onPositiveClick={handlePositive}
        positiveButtonProps={{ loading: loading.value }}
      >
        {{
          trigger: () => (
            <NButton
              text
              size="small"
              type={props.type}
              disabled={props.disabled}
            >
              {props.label}
            </NButton>
          ),
          default: () => props.content,
        }}
      </NPopconfirm>
    )
  },
})

/** 表格操作列：文字按钮 + 竖向分隔线，自动跳过隐藏项之间的分隔线 */
export function renderTableActions(actions: TableActionItem[]) {
  const visible = actions.filter(action => action.show !== false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {visible.map((action, index) => {
        const button = action.confirm
          ? (
              <ConfirmAction
                label={action.label}
                type={action.type}
                content={action.confirm}
                disabled={action.disabled}
                externalLoading={action.confirmLoading}
                onClick={action.onClick}
              />
            )
          : (
              <NButton
                text
                size="small"
                type={action.type}
                disabled={action.disabled}
                onClick={action.onClick}
              >
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
