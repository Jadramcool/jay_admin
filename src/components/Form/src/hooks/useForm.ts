import type { FormActionType } from '../types'
import { nextTick, onUnmounted, shallowRef, unref, watch } from 'vue'
import { isProdMode } from '@/utils/common/is'

/**
 * useForm — 父组件侧的 composable
 *
 * 职责：
 *   1. 返回 [register, methods]，register 绑定到 <BasicForm @register>，
 *      methods 是对 BasicForm 内部 API 的异步代理
 *   2. 在 register 回调中建立 watch，将外部 props（如 schemas、gridProps）
 *      同步传入 BasicForm.setProps
 *
 * 使用方式：
 *   const [register, { setFieldsValue, validate }] = useForm({ schemas, ... });
 *   <BasicForm @register="register" />
 */
export function useForm(props?: any) {
  const formRef = shallowRef<Nullable<FormActionType>>(null)
  const loadedRef = shallowRef<Nullable<boolean>>(false)

  /**
   * register — 由 <BasicForm @register="register"> 在 onMounted 时触发。
   * instance 是 BasicForm 内部暴露的 formAction 对象（不是组件实例本身）。
   */
  const register = (instance: FormActionType) => {
    // 生产环境下，组件卸载时清理引用
    if (isProdMode()) {
      onUnmounted(() => {
        formRef.value = null
        loadedRef.value = null
      })
    }
    // 防止重复注册（HMR 开发模式下可能触发多次）
    if (unref(loadedRef) && isProdMode() && instance === unref(formRef))
      return

    formRef.value = instance
    loadedRef.value = true

    /**
     * resolveProps：props 中的值可能是 Ref / ComputedRef / 普通值，
     * 统一通过 unref 取出真实值后再传给 BasicForm。
     */
    const resolveProps = (p: any) => {
      if (!p || typeof p !== 'object')
        return p
      const resolved: any = {}
      for (const key of Object.keys(p)) {
        resolved[key] = unref(p[key])
      }
      return resolved
    }

    /**
     * 深度监听外部 props 变化，自动同步到 BasicForm 内部。
     * immediate: true 让第一次注册时就触发一次 setProps，把初始 props 推入。
     * deep: true 让 tableRef.value 这类嵌套 ref 变化时也能触发。
     */
    watch(
      () => props,
      () => {
        if (props) {
          instance.setProps(resolveProps(props))
        }
      },
      { immediate: true, deep: true },
    )
  }

  /**
   * getForm — 获取 formAction 实例。
   * 由于父组件可能在 onMounted 前调用 methods，先 await nextTick 确保注册已发生。
   */
  async function getForm(): Promise<FormActionType> {
    const form = unref(formRef)
    if (!form) {
      console.error('Form instance not found')
    }
    await nextTick()
    return form as FormActionType
  }

  /**
   * methods — 对 BasicForm 内部 API 的异步代理。
   * 每个方法都先 await getForm() 等待实例就绪，再调用实际方法。
   */
  const methods = {
    setProps: async (formProps: any) => {
      const form = await getForm()
      form.setProps(formProps)
    },
    getFieldsValue: <T = Recordable>() => {
      return unref(formRef)?.getFieldsValue() as T
    },
    resetFields: async () => {
      const form = await getForm()
      form.resetFields()
    },
    clearValidate: async (name?: string | string[]) => {
      const form = await getForm()
      form.clearValidate(name)
    },
    setFieldsValue: async (values: Recordable) => {
      const form = await getForm()
      form.setFieldsValue(values)
    },
    validate: async () => {
      const form = await getForm()
      return form.validate()
    },
    validateFields: async (name: string | string[]) => {
      const form = await getForm()
      return form.validateFields(name)
    },
    updateSchema: async (data: any) => {
      const form = await getForm()
      form.updateSchema(data)
    },
    submit: async () => {
      const form = await getForm()
      return form.submit()
    },
  }

  return [register, methods] as const
}
