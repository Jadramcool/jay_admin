import type { ComponentType } from './components'

export interface FormSchema {
  field: string
  label?: string
  labelMessage?: string
  labelMessageStyle?: Recordable
  defaultValue?: any
  component?: ComponentType
  componentProps?: Recordable | ((opt: { schema: FormSchema, formModel: Recordable }) => Recordable)
  componentSlots?: Recordable
  slot?: string
  rules?: any
  giProps?: Recordable
  ifShow?: boolean | ((opt: { values: Recordable, schema: FormSchema }) => boolean)
  show?: boolean
  isFull?: boolean
  suffix?: string
  query?: 'in' | 'not_in'
}

export interface FormActionType {
  setProps: (props: Recordable) => void
  getFieldsValue: <T = Recordable>() => T
  resetFields: () => void
  clearValidate: (name?: string | string[]) => void
  setFieldsValue: (values: Recordable) => void
  validate: () => Promise<any>
  validateFields: (name: string | string[]) => Promise<any>
  updateSchema: (data: Partial<FormSchema> | Partial<FormSchema>[]) => void
  submit: () => Promise<void>
  getComponentInstance: (key: string) => any
}
