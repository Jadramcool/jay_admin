import { describe, expect, it } from 'vitest'
import {
  createSupplementalPageRoutes,
  resolveRouteComponent,
} from './dynamic-route'

const userComponent = () => Promise.resolve({})
const noticeComponent = () => Promise.resolve({})
const components = {
  '/src/views/system/user/UserEdit.vue': userComponent,
  '/src/views/notice/notice/NoticeEdit.vue': noticeComponent,
}

describe('dynamic route helpers', () => {
  it('resolves legacy component paths case-insensitively', () => {
    expect(
      resolveRouteComponent(
        '/src/views/notice/notice/noticeEdit.vue',
        components,
      ),
    ).toBe(noticeComponent)
  })

  it('adds create pages only when their permissions are granted', () => {
    const routes = createSupplementalPageRoutes(
      ['system:user:create'],
      components,
    )

    expect(routes.map(route => route.path)).toEqual(['/system/user/edit'])
  })

  it('adds both verified create routes for an administrator', () => {
    const routes = createSupplementalPageRoutes(
      ['system:user:create', 'notice:create'],
      components,
    )

    expect(routes.map(route => route.path)).toEqual([
      '/system/user/edit',
      '/notice/notice/add',
    ])
  })
})
