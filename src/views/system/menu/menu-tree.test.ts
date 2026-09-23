import { describe, expect, it } from 'vitest'
import {
  buildMenuPayload,
  buildParentOptions,
  filterMenuTree,
} from './menu-tree'

function menu(over: Partial<System.Menu> = {}): System.Menu {
  return {
    id: 1,
    code: 'Node',
    name: '节点',
    type: 'MENU',
    enable: true,
    show: true,
    children: undefined,
    ...over,
  } as System.Menu
}

/** 目录(1) → 菜单(2) → 按钮(3)；目录(1) 下还有菜单(4) */
const tree: System.Menu[] = [
  menu({
    id: 1,
    code: 'System',
    name: '系统管理',
    type: 'DIRECTORY',
    children: [
      menu({
        id: 2,
        code: 'UserList',
        name: '用户列表',
        type: 'MENU',
        pid: 1,
        children: [
          menu({
            id: 3,
            code: 'system:user:create',
            name: '新增用户',
            type: 'BUTTON',
            pid: 2,
            permission: 'system:user:create',
            enable: false,
          }),
        ],
      }),
      menu({ id: 4, code: 'Role', name: '角色管理', type: 'MENU', pid: 1 }),
    ],
  }),
]

describe('buildParentOptions', () => {
  it('按钮的候选父级里目录与菜单都可选（页面级与模块级两种挂法）', () => {
    const options = buildParentOptions(tree, 'BUTTON')

    expect(options[0].disabled).toBe(false)
    expect(options[0].children?.every(item => item.disabled === false)).toBe(true)
  })

  it('按钮的候选父级里按钮不可选', () => {
    const options = buildParentOptions(tree, 'DIRECTORY')

    expect(options[0].children?.[0].children?.[0].disabled).toBe(true)
  })

  it('菜单的候选父级里目录可选、菜单不可选', () => {
    const options = buildParentOptions(tree, 'MENU')

    expect(options[0].disabled).toBe(false)
    expect(options[0].children?.every(item => item.disabled)).toBe(true)
  })

  it('剔除自身及其子树，避免把节点挂到自己的后代下', () => {
    const options = buildParentOptions(tree, 'MENU', 2)

    expect(options[0].children?.map(item => item.id)).toEqual([4])
  })

  it('剔除的是整棵子树而不只是自身', () => {
    const options = buildParentOptions(tree, 'DIRECTORY', 1)

    expect(options).toEqual([])
  })
})

describe('filterMenuTree', () => {
  it('无筛选条件时原样返回', () => {
    expect(filterMenuTree(tree, {})).toBe(tree)
  })

  it('命中子节点时保留父链，避免出现找不到父亲的裸节点', () => {
    const result = filterMenuTree(tree, { keyword: '新增用户' })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].children?.[0].id).toBe(2)
    expect(result[0].children?.[0].children?.[0].id).toBe(3)
  })

  it('关键字同时匹配名称、路由标识与权限码', () => {
    expect(filterMenuTree(tree, { keyword: 'Role' })[0].children?.map(i => i.id)).toEqual([4])
    expect(filterMenuTree(tree, { keyword: 'system:user:create' })[0].children?.[0].children?.[0].id).toBe(3)
  })

  it('按类型筛选时同样保留祖先链', () => {
    const result = filterMenuTree(tree, { type: 'BUTTON' })

    expect(result[0].children?.[0].children?.map(i => i.id)).toEqual([3])
  })

  it('按启用状态筛选（enable 同时是鉴权过滤条件）', () => {
    const disabled = filterMenuTree(tree, { status: 'disabled' })

    expect(disabled[0].children?.[0].children?.map(i => i.id)).toEqual([3])
    expect(filterMenuTree(tree, { status: 'enabled' })[0].children?.map(i => i.id)).toEqual([2, 4])
  })

  it('过滤结果不残留空 children 数组（否则树表会渲染出展开箭头）', () => {
    const result = filterMenuTree(tree, { type: 'MENU' })

    expect(result[0].children?.[0].children).toBeUndefined()
  })
})

describe('buildMenuPayload', () => {
  it('按钮行只提交自身字段，容器字段被裁掉', () => {
    const payload = buildMenuPayload(
      {
        id: 3,
        type: 'BUTTON',
        name: '新增用户',
        code: 'whatever',
        permission: 'system:user:create',
        pid: 2,
        order: 0,
        enable: true,
        layout: 'normal',
        target: '_self',
        keepAlive: true,
        component: '/src/views/system/user/index.vue',
      },
      'BUTTON',
    )

    expect(payload).toEqual({
      id: 3,
      type: 'BUTTON',
      name: '新增用户',
      permission: 'system:user:create',
      pid: 2,
      order: 0,
      enable: true,
      // 路由标识与权限码强制同源
      code: 'system:user:create',
      // 可空容器字段显式置 null，不残留页面组件路径
      component: null,
    })
  })

  it('目录/菜单行的权限码被清空（权限码只声明在按钮行）', () => {
    const payload = buildMenuPayload(
      {
        id: 2,
        type: 'MENU',
        name: '用户列表',
        code: 'UserList',
        permission: 'system:user:list',
        pid: 1,
      },
      'MENU',
    )

    expect(payload.permission).toBeNull()
  })

  it('隐藏字段不落库：目录行不会带上 keepAlive / component', () => {
    const payload = buildMenuPayload(
      {
        id: 1,
        type: 'DIRECTORY',
        name: '系统管理',
        code: 'System',
        component: '/src/views/system/user/index.vue',
        keepAlive: true,
      },
      'DIRECTORY',
    )

    expect(payload).not.toHaveProperty('keepAlive')
    expect(payload.component).toBeNull()
  })

  it('withContentCard 这类虚拟字段不会直接进入负载', () => {
    const payload = buildMenuPayload(
      { type: 'MENU', name: '用户列表', code: 'UserList', withContentCard: false },
      'MENU',
    )

    expect(payload).not.toHaveProperty('withContentCard')
  })
})
