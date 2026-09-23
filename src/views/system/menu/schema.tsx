import { Icon } from '@iconify/vue/dist/iconify.js'
import dayjs from 'dayjs'
import { NTag } from 'naive-ui'
import { computed } from 'vue'
import { MenuApi } from '@/api/system'
import { menuTypeOptions } from '@/constants'
import { columnsUtil, editFormSchemaUtil, formSchemaUtil, renderTableActions } from '@/utils'
import { hasPermission } from '@/utils/common/hasPermission'
import { buildParentOptions, MENU_TYPE_LABEL } from './menu-tree'

/**
 * 「父级菜单」候选参数缓存
 *
 * componentProps 以函数形式声明，每次表单模型变化都会重新求值；若每次返回新对象，
 * ApiTreeSelect 的 `watch(params, loadData, { deep: true })` 会在任意字段输入时重复拉树。
 * 用 (类型, 自身ID) 做键复用同一对象，保证只有真正影响候选集的改动才触发重新加载。
 */
const parentOptionParamsCache = new Map<string, { type: string, selfId: number | null }>()

function getParentOptionParams(type?: string, selfId?: number | null) {
  const key = `${type ?? ''}#${selfId ?? ''}`
  let params = parentOptionParamsCache.get(key)
  if (!params) {
    params = { type: type ?? 'MENU', selfId: selfId ?? null }
    parentOptionParamsCache.set(key, params)
  }
  return params
}

export function useMenuSchema(methods: any = {}) {
  const schema = computed(() => ({
    properties: [
      {
        key: 'id',
        label: 'ID',
        defaultValue: undefined,
        editForm: { ifShow: false },
      },
      // ==================== 查询表单专用字段 ====================
      // 菜单树一次取全、筛选在前端完成，这套字段不参与新增/编辑表单
      {
        key: 'keyword',
        label: '关键字',
        form: {
          component: 'NInput',
          componentProps: { placeholder: '名称 / 路由标识 / 权限码' },
        },
      },
      {
        key: 'typeFilter',
        label: '类型',
        form: {
          component: 'NSelect',
          componentProps: {
            options: menuTypeOptions,
            placeholder: '全部类型',
            clearable: true,
          },
        },
      },
      {
        key: 'statusFilter',
        label: '状态',
        form: {
          component: 'NSelect',
          componentProps: {
            options: [
              { label: '启用', value: 'enabled' },
              { label: '停用', value: 'disabled' },
            ],
            placeholder: '全部状态',
            clearable: true,
          },
        },
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
          width: 90,
          render: (row: any) => {
            const map: Record<string, { label: string, color: string }> = {
              DIRECTORY: { label: MENU_TYPE_LABEL.DIRECTORY, color: 'info' },
              MENU: { label: MENU_TYPE_LABEL.MENU, color: 'success' },
              BUTTON: { label: MENU_TYPE_LABEL.BUTTON, color: 'warning' },
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
        table: {
          align: 'left',
          width: 220,
          ellipsis: { tooltip: true },
          fixed: 'left',
        },
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
        // 权限码只声明在按钮行：目录/菜单行的可见性取决于角色是否被分配该节点，
        // 接口鉴权则由该页面下的按钮行承载（后端会强制把非按钮行的 permission 落库为 null）
        ifShow: ({ values }: any) => values.type === 'BUTTON',
        editForm: {
          component: 'NInput',
          componentProps: {
            placeholder: '与接口 @RequirePermissions 的 code 一致，如 system:user:create',
          },
          rules: [
            { required: true, message: '按钮必须填写权限标识', trigger: 'blur' },
          ],
        },
        table: {
          width: 190,
          ellipsis: { tooltip: true },
          render: (row: any) => row.permission || '-',
        },
      },
      {
        key: 'code',
        label: '路由标识',
        defaultValue: undefined,
        // 按钮不使用路由标识：其 code 由权限码派生（提交时强制同源）
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        form: {
          component: 'NInput',
          componentProps: { placeholder: '路由标识' },
        },
        editForm: {
          rules: [{ required: true, message: '请输入路由标识', trigger: 'blur' }],
          componentProps: {
            placeholder: '例如: UserList（已作为路由 name，创建后改名会导致标签页缓存失效）',
          },
        },
        table: {
          width: 150,
          ellipsis: { tooltip: true },
        },
      },
      {
        key: 'icon',
        label: '图标',
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'IconPicker' },
        table: {
          width: 70,
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
        table: {
          width: 190,
          ellipsis: { tooltip: true },
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
          // 候选集按当前类型过滤：目录/菜单只能挂目录下，按钮只能挂菜单下；
          // 同时剔除自身子树，从交互层杜绝成环（后端仍会再校验一次）
          componentProps: ({ formModel }: any) => {
            const type = formModel?.type ?? 'MENU'
            const selfId = formModel?.id ?? null
            return {
              api: (params: { type: string, selfId: number | null }) =>
                MenuApi.tree().then(tree =>
                  buildParentOptions(tree ?? [], params.type as any, params.selfId),
                ),
              params: getParentOptionParams(type, selfId),
              placeholder: type === 'BUTTON' ? '所属目录 / 菜单（必选）' : '不选则作为根节点',
              labelField: 'name',
              keyField: 'id',
              clearable: true,
              filterable: true,
            }
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
        table: { width: 80 },
      },
      {
        key: 'show',
        label: '显示',
        defaultValue: true,
        ifShow: ({ values }: any) => values.type !== 'BUTTON',
        editForm: { component: 'NSwitch' },
        table: {
          width: 80,
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
        key: 'enable',
        label: '启用',
        defaultValue: true,
        // enable 同时是鉴权与导航的过滤条件：按钮停用即刻退出权限集合，
        // 目录/菜单停用则整棵子树从侧边栏与用户菜单中消失，因此必须可见可改
        editForm: { component: 'NSwitch' },
        table: {
          width: 80,
          render: (row: any) => {
            const enabled = row.enable !== false
            return (
              <NTag bordered={false} type={(enabled ? 'success' : 'error') as any} size="small">
                {enabled ? '启用' : '停用'}
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
          width: 170,
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
          width: 200,
          render: (row: any) => renderTableActions([
            {
              label: '添加子菜单',
              show: row.type !== 'BUTTON' && hasPermission('system:menu:create'),
              onClick: () => methods.handleAddChild(row),
            },
            {
              label: '编辑',
              type: 'info',
              show: hasPermission('system:menu:update'),
              onClick: () => methods.handleEdit(row),
            },
            {
              label: '删除',
              type: 'error',
              show: hasPermission('system:menu:delete'),
              onClick: () => methods.handleDelete(row),
            },
          ]),
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
    'enable',
    'createdTime',
    'operate',
  ]
  const formFields = ['keyword', 'typeFilter', 'statusFilter']
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
    'enable',
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
