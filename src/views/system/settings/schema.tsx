import type { Ref } from 'vue'
import dayjs from 'dayjs'
import { NTag } from 'naive-ui'
import { computed, ref } from 'vue'
import {
  columnsUtil,
  editFormSchemaUtil,
  formSchemaUtil,
  renderTableActions,
} from '@/utils'
import { hasPermission } from '@/utils/common/hasPermission'
import {
  EXPOSE_TAG,
  EXPOSE_TEXT,
  SOURCE_OPTIONS,
  SOURCE_TAG,
  SOURCE_TEXT,
  TYPE_OPTIONS,
  TYPE_TEXT,
} from './typeLabels'

/**
 * 系统设置 schema(沿用其它管理页的 schema-driven CRUD 写法)。
 *
 * 字段描述的是**设置项的元数据**(名称/键名/值/类型/分组/来源/可见性/版本/更新人/时间),
 * 与具体设置项无关 —— 因此后端注册表新增一项设置时,这里不需要改动;
 * 值的展示与编辑控件都按注册表声明的 `type` 动态渲染。
 *
 * - `useSettingSchema()`      列表页:表格列 + 查询表单字段
 * - `useSettingEditSchema()`  编辑弹窗:editForm 字段
 * 两者共用同一份 properties 定义。
 */
export interface SettingSchemaMethods {
  handleEdit: (row: System.SettingView) => void
  handleHistory: (row: System.SettingView) => void
  handleReset: (row: System.SettingView) => void
}

/** 列表表格列顺序 */
const TABLE_FIELDS = [
  'label',
  'key',
  'value',
  'type',
  'group',
  'source',
  'expose',
  'version',
  'updatedName',
  'updatedTime',
  'operate',
]
/** 查询表单字段 */
const QUERY_FIELDS = ['label', 'key', 'group', 'type', 'source']
/** 编辑弹窗字段 */
const EDIT_FIELDS = ['value', 'reason']

/** 列表与弹窗共用的字段定义 */
function fieldProperties(
  groupOptions: Ref<{ label: string, value: string }[]>,
) {
  return [
    {
      key: 'label',
      label: '名称',
      table: { width: 160, ellipsis: { tooltip: true }, sorter: true },
      form: {
        component: 'NInput',
        componentProps: { placeholder: '请输入名称' },
      },
    },
    {
      key: 'key',
      label: '键名',
      table: { width: 200, ellipsis: { tooltip: true }, sorter: true },
      form: {
        component: 'NInput',
        componentProps: { placeholder: '请输入键名' },
      },
    },
    {
      key: 'value',
      label: '当前值',
      table: {
        width: 240,
        ellipsis: { tooltip: true },
        render: (row: System.SettingView) => renderSettingValue(row),
      },
      // 值控件随注册表类型变化(字符串/数字/颜色/JSON/选项…),
      // 用 FormItem 的具名插槽交给弹窗渲染,避免把业务组件塞进公共 componentMap
      editForm: {
        label: '设置值',
        slot: 'settingValue',
      },
    },
    {
      key: 'type',
      label: '类型',
      table: {
        width: 110,
        render: (row: System.SettingView) => (
          <NTag size="small">{TYPE_TEXT[row.type] || row.type}</NTag>
        ),
      },
      form: {
        component: 'NSelect',
        componentProps: { options: TYPE_OPTIONS, placeholder: '请选择类型' },
      },
    },
    {
      key: 'group',
      label: '分组',
      table: {
        width: 100,
        render: (row: System.SettingView) => (
          <NTag size="small">{row.group}</NTag>
        ),
      },
      form: {
        component: 'NSelect',
        componentProps: {
          // 注意:这里必须是普通数组 —— 放 computed 会让 NSelect 收到 ref 对象而渲染出空选项
          options: [{ label: '全部', value: '' }, ...groupOptions.value],
          placeholder: '请选择分组',
        },
      },
    },
    {
      key: 'source',
      label: '来源',
      table: {
        width: 130,
        render: (row: System.SettingView) => (
          <div class="flex items-center gap-1">
            <NTag size="small" type={SOURCE_TAG[row.source]}>
              {SOURCE_TEXT[row.source] || row.source}
            </NTag>
            {row.invalid && (
              <NTag size="small" type="error">
                值异常
              </NTag>
            )}
          </div>
        ),
      },
      form: {
        component: 'NSelect',
        componentProps: { options: SOURCE_OPTIONS, placeholder: '请选择来源' },
      },
    },
    {
      key: 'expose',
      label: '可见性',
      table: {
        width: 100,
        render: (row: System.SettingView) => (
          <NTag size="small" type={EXPOSE_TAG[row.expose]}>
            {EXPOSE_TEXT[row.expose] || row.expose}
          </NTag>
        ),
      },
    },
    {
      key: 'version',
      label: '版本',
      table: {
        width: 80,
        sorter: true,
        render: (row: System.SettingView) =>
          row.version ? `v${row.version}` : '-',
      },
    },
    {
      key: 'updatedName',
      label: '更新人',
      table: {
        width: 110,
        ellipsis: { tooltip: true },
        render: (row: System.SettingView) => row.updatedName || '-',
      },
    },
    {
      key: 'updatedTime',
      label: '更新时间',
      table: {
        width: 170,
        sorter: true,
        render: (row: System.SettingView) =>
          row.updatedTime
            ? dayjs(row.updatedTime).format('YYYY-MM-DD HH:mm:ss')
            : '-',
      },
    },
    {
      key: 'reason',
      label: '变更原因',
      editForm: {
        component: 'NInput',
        componentProps: {
          placeholder: '例如：调整品牌名',
          maxlength: 255,
        },
      },
    },
  ]
}

/** 列表页:表格列 + 查询表单 */
export function useSettingSchema(
  methods: SettingSchemaMethods,
  groupOptions: Ref<{ label: string, value: string }[]>,
) {
  const canUpdate = hasPermission('system:setting:update')
  const canList = hasPermission('system:setting:list')

  const schema = computed(() => ({
    properties: [
      ...fieldProperties(groupOptions),
      {
        key: 'operate',
        label: '操作',
        table: {
          fixed: 'right',
          width: 200,
          render: (row: System.SettingView) =>
            renderTableActions([
              {
                label: '编辑',
                type: 'info',
                show: canUpdate && row.source !== 'env',
                onClick: () => methods.handleEdit(row),
              },
              {
                label: '历史',
                type: 'primary',
                show: canList,
                onClick: () => methods.handleHistory(row),
              },
              {
                label: '重置',
                type: 'warning',
                show: canUpdate && row.overridden,
                confirm: `确定将「${row.label}」重置为默认值？`,
                onClick: () => methods.handleReset(row),
              },
            ]),
        },
      },
    ],
    setting: { table: { resizable: true } },
  }))

  return {
    columns: computed(() => columnsUtil(schema.value, TABLE_FIELDS)),
    formSchemas: computed(() => formSchemaUtil(schema.value, QUERY_FIELDS)),
  }
}

/** 编辑弹窗:editForm 字段(值控件由弹窗通过 settingValue 插槽渲染) */
export function useSettingEditSchema() {
  const schema = computed(() => ({
    properties: fieldProperties(ref([])),
    setting: {},
  }))

  return {
    editFormSchemas: computed(() =>
      editFormSchemaUtil(schema.value, EDIT_FIELDS),
    ),
  }
}

/** 当前值的表格展示:按注册表声明的类型渲染,密钥不回显明文 */
function renderSettingValue(row: System.SettingView) {
  if (row.expose === 'secret')
    return row.configured ? '••••••（已配置）' : '未配置'
  if (row.source === 'env')
    return '由环境变量提供'

  const { value } = row
  if (value === null || value === undefined || value === '')
    return '-'

  switch (row.type) {
    case 'boolean':
      return value ? '是' : '否'
    case 'json':
    case 'string[]':
      return JSON.stringify(value)
    case 'color':
      return (
        <div class="flex items-center gap-1">
          <span
            class="inline-block h-3 w-3 rounded"
            style={{ background: String(value) }}
          />
          <span>{String(value)}</span>
        </div>
      )
    default:
      return String(value)
  }
}
