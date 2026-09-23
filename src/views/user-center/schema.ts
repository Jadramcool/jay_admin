import type { FormSchema } from '@/components/Form/src/types'
import dayjs from 'dayjs'
import { cityTreeData, sexOptions } from '@/constants'
import { isPhone } from '@/utils'

/** 可选字段校验：留空不报错，填了才检查格式（async-validator callback 风格，空字符串也会进入 pattern 校验） */
function optionalPatternRule(message: string, test: (v: string) => boolean) {
  return {
    validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
      if (!value || test(value))
        callback()
      else
        callback(new Error(message))
    },
    trigger: 'blur',
  }
}

/** 基本信息字段 */
export const basicInfoSchemas: FormSchema[] = [
  {
    field: 'name',
    label: '姓名',
    component: 'NInput',
    componentProps: { placeholder: '例如：张三', maxlength: 32 },
    defaultValue: '',
  },
  {
    field: 'sex',
    label: '性别',
    component: 'NSelect',
    componentProps: { placeholder: '选择性别…', options: sexOptions },
    defaultValue: null,
  },
  {
    field: 'birthday',
    label: '生日',
    component: 'NDatePicker',
    componentProps: { type: 'date', placeholder: '选择生日…' },
    defaultValue: null,
  },
  {
    field: 'position',
    label: '职位',
    component: 'NInput',
    componentProps: { placeholder: '例如：前端工程师', maxlength: 64 },
    defaultValue: '',
  },
]

/** 联系方式字段 */
export const contactSchemas: FormSchema[] = [
  {
    field: 'phone',
    label: '手机号',
    component: 'NInput',
    componentProps: {
      placeholder: '例如：13800138000',
      maxlength: 11,
      clearable: true,
    },
    rules: [optionalPatternRule('手机号格式不正确', isPhone)],
    defaultValue: '',
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'NInput',
    componentProps: { placeholder: '例如：name@example.com', maxlength: 64 },
    rules: [
      optionalPatternRule('邮箱格式不正确', v => /^[\w.-]+@[\w-]+(?:\.[\w-]+)+$/.test(v)),
    ],
    defaultValue: '',
  },
  {
    field: 'city',
    label: '城市',
    component: 'NCascader',
    componentProps: {
      placeholder: '选择省份/城市…',
      options: cityTreeData,
      valueField: 'key',
      labelField: 'label',
      childrenField: 'children',
      filterable: true,
    },
    defaultValue: null,
  },
  {
    field: 'address',
    label: '地址',
    component: 'NInput',
    componentProps: { placeholder: '例如：朝阳区建国路', maxlength: 64 },
    defaultValue: '',
  },
  {
    field: 'addressDetail',
    label: '详细地址',
    component: 'NInput',
    componentProps: { placeholder: '例如：A座 1201室', maxlength: 64 },
    giProps: { span: 2 },
    defaultValue: '',
  },
]

/** API→表单 数据转换 */
export function mapUserInfoToForm(data: Api.UserInfo) {
  return {
    name: data.name || '',
    sex: data.sex || null,
    birthday: data.birthday ? dayjs(data.birthday).valueOf() : null,
    position: data.position || '',
    phone: data.phone || '',
    email: data.email || '',
    city: data.city || null,
    address: data.address || '',
    addressDetail: data.addressDetail || '',
  }
}

/** 表单→API 数据转换 */
export function mapFormToSubmit(values: Recordable) {
  return {
    ...values,
    birthday: values.birthday
      ? dayjs(values.birthday).format('YYYY-MM-DD')
      : undefined,
  }
}
