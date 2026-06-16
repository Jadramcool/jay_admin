import { Icon } from '@iconify/vue/dist/iconify.js'
import dayjs from 'dayjs'
import { NButton, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'
import { MenuApi } from '@/api/system'
import { menuTypeOptions } from '@/constants'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil } from '@/utils'

export function useMenuSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        key: 'id',
        label: 'ID',
        defaultValue: undefined,
        editForm: { ifShow: false },
      },
      {
        key: 'type',
        label: '类型',
        defaultValue: 'MENU',
        editForm: {
          component: 'RadioButtonGroup',
          componentProps: { options: menuTypeOptions },
        },
        table: {
          align: 'left',
          render: (row: any) => {
            const map: Record<string, { label: string, color: string }> = {
              DIRECTORY: { label: '目录', color: 'info' },
              MENU: { label: '菜单', color: 'success' },
              BUTTON: { label: '按钮', color: 'warning' },
            }
            const info = map[row.type]
            return info
              ? (
                  <NTag bordered={false} type={info.color as any} size="small">
                    {info.label}
                  </NTag>
                )
              : (
                  '-'
                )
          },
        },
      },
      {
        key: 'name',
        label: '名称',
        defaultValue: undefined,
        table: { align: 'left' },
        form: {
          component: 'NInput',
          componentProps: { placeholder: '菜单名称' },
        },
        editForm: {
          rules: [
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
          ],
        },
      },
      {
        key: 'permission',
        label: '权限标识',
        defaultValue: undefined,
        ifShow: ({ values }: any) => values.type === 'MENU' || values.type === 'BUTTON',
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '例如: system:user:list' },
        },
        table: {
          render: (row: any) => row.permission || '-',
        },
      },
      {
        key: 'code',
        label: '路由标识',
        defaultValue: undefined,
        form: {
          component: 'NInput',
          componentProps: { placeholder: '路由标识' },
        },
        editForm: {
          rules: [{ required: true, message: '请输入路由标识', trigger: 'blur' }],
          componentProps: { placeholder: '例如: UserList' },
        },
      },
      {
        key: 'icon',
        label: '图标',
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'IconPicker' },
        table: {
          render: (row: any) => (row.icon ? <Icon icon={row.icon} /> : '-'),
        },
      },
      {
        key: 'path',
        label: '路由路径',
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: {
          component: 'NInput',
          rules: [
            { required: true, message: '请输入路由路径', trigger: 'blur' },
          ],
          componentProps: { placeholder: '/system/user' },
        },
      },
      {
        key: 'component',
        label: '组件路径',
        ifShow: ({ values }: any) => values.type === 'MENU',
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: '/src/views/system/user/index.vue' },
        },
      },
      {
        key: 'pid',
        label: '父级菜单',
        defaultValue: null,
        editForm: {
          component: 'ApiTreeSelect',
          componentProps: {
            api: MenuApi.tree,
            placeholder: '请选择父菜单',
            labelField: 'name',
            keyField: 'id',
            clearable: true,
            filterable: true,
          },
        },
      },
      {
        key: 'target',
        label: '打开方式',
        defaultValue: '_self',
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: {
          component: 'NSelect',
          componentProps: {
            options: [
              { label: '当前窗口', value: '_self' },
              { label: '新窗口', value: '_blank' },
            ],
          },
        },
      },
      {
        key: 'layout',
        label: '布局',
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: {
          component: 'NSelect',
          defaultValue: 'normal',
          componentProps: {
            options: [
              { label: '默认布局', value: 'normal' },
              { label: '空白布局', value: 'empty' },
            ],
          },
        },
      },
      {
        key: 'isFrame',
        label: '外部链接',
        defaultValue: false,
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'frameSrc',
        label: '外部链接地址',
        ifShow: ({ values }: any) => values.isFrame && values.type !== 'BUTTON',
        editForm: {
          component: 'NInput',
          componentProps: { placeholder: 'https://example.com' },
        },
      },
      {
        key: 'affix',
        label: '固定标签页',
        defaultValue: false,
        ifShow: ({ values }: any) => values.type === 'MENU',
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'alwaysShow',
        label: '始终显示目录',
        defaultValue: false,
        ifShow: ({ values }: any) => values.type === 'DIRECTORY',
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'order',
        label: '排序',
        defaultValue: 0,
        editForm: {
          component: 'NInputNumber',
          componentProps: { min: 0, precision: 0 },
        },
      },
      {
        key: 'show',
        label: '显示',
        defaultValue: true,
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'NSwitch' },
        table: {
          render: (row: any) => {
            const color = row.show ? 'success' : 'warning'
            return (
              <NTag bordered={false} type={color as any} size="small">
                {row.show ? '显示' : '隐藏'}
              </NTag>
            )
          },
        },
      },
      {
        key: 'keepAlive',
        label: '缓存',
        defaultValue: false,
        ifShow: ({ values }: any) => values.type === 'MENU',
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'withContentCard',
        label: '内容卡片',
        defaultValue: true,
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'NSwitch' },
      },
      {
        key: 'redirect',
        label: '重定向',
        ifShow: ({ values }: any) =>
          values.type === 'MENU' || values.type === 'DIRECTORY',
        editForm: {
          component: 'NInput',
          giProps: { span: 2 },
          componentProps: { placeholder: '/default/home' },
        },
      },
      {
        key: 'description',
        label: '描述',
        editForm: {
          component: 'NInput',
          giProps: { span: 2 },
          componentProps: { type: 'textarea' },
        },
      },
      {
        key: 'badge',
        label: '徽标',
        defaultValue: undefined,
        editForm: {
          component: 'NInput',
          componentProps: {
            placeholder: '暂未支持',
            disabled: true,
          },
        },
      },
      {
        key: 'badgeType',
        label: '徽标类型',
        defaultValue: undefined,
        editForm: {
          component: 'NSelect',
          componentProps: {
            options: [
              { label: '小圆点', value: 'dot' },
              { label: '数字', value: 'number' },
              { label: '文本', value: 'text' },
            ],
            disabled: true,
          },
        },
      },
      {
        key: 'createdTime',
        label: '创建时间',
        table: {
          render: (row: any) =>
            row.createdTime
              ? dayjs(row.createdTime).format('YYYY-MM-DD HH:mm')
              : '-',
        },
      },
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 280,
          render: (row: any) => (
            <NSpace justify="center">
              {row.type !== 'BUTTON' && (
                <NButton
                  type="info"
                  ghost
                  size="small"
                  onClick={() => methods.handleAddChild(row)}
                >
                  添加子菜单
                </NButton>
              )}
              <NButton
                type="primary"
                ghost
                size="small"
                onClick={() => methods.handleEdit(row)}
              >
                编辑
              </NButton>
              <NButton
                type="error"
                ghost
                size="small"
                onClick={() => methods.handleDelete(row)}
              >
                删除
              </NButton>
            </NSpace>
          ),
        },
      },
    ],
  }))

  const tableFields = [
    'name',
    'type',
    'permission',
    'code',
    'path',
    'icon',
    'order',
    'show',
    'createdTime',
    'operate',
  ]
  const formFields = ['name']
  const editFormFields = [
    'id',
    'type',
    'pid',
    'name',
    'permission',
    'code',
    'icon',
    'path',
    'component',
    'target',
    'layout',
    'isFrame',
    'frameSrc',
    'affix',
    'alwaysShow',
    'redirect',
    'order',
    'show',
    'keepAlive',
    'withContentCard',
    'description',
    'badge',
    'badgeType',
  ]

  const columns = computed(() => columnsUtil(schema.value, tableFields))
  const formSchemas = computed(() => formSchemaUtil(schema.value, formFields))
  const editFormSchemas = computed(() =>
    editFormSchemaUtil(schema.value, editFormFields),
  )

  return { columns, formSchemas, editFormSchemas }
}
