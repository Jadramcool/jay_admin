/**
 * Plop 代码生成器
 *
 * 用法: pnpm gen:page <name>        (如 pnpm gen:page user-group)
 *       domain 默认 system，直接回车即可
 *
 * 生成内容(前端):
 *   - src/api/<domain>/<kebab>.ts                            API 封装(列表/详情/创建/更新/删除/批量删除)
 *   - src/views/<domain>/<kebab>/schema.tsx                  字段唯一源(表格/查询/编辑三投影)
 *   - src/views/<domain>/<kebab>/index.vue                   列表页(FormQuery + BasicTable + 弹窗)
 *   - src/views/<domain>/<kebab>/components/<Pascal>Modal.vue 新增/编辑弹窗
 *   - e2e/<kebab>.spec.ts                                    冒烟用例(需先完成手动步骤 3)
 *
 * 生成后需手动:
 *   1. 在 src/api/<domain>/index.ts 追加一行导出:
 *        export { <Pascal>Api } from './<kebab>'
 *      (生成器不自动改写已存在的 index.ts，避免误伤既有文件)
 *   2. 在 typings/system.d.ts 补充 <Pascal> / <Pascal>CreatePayload / <Pascal>UpdatePayload
 *      (响应类型暂未接入 OpenAPI 生成)；完成本步之前 pnpm typecheck 不会通过
 *   3. 在 api-server/prisma/initData/menu.ts 增加 MENU + BUTTON 节点
 *      (BUTTON 的 code 与 permission 同值)，然后 cd api-server && pnpm prisma:seed
 *   4. 按 skill admin-module-scaffold 的 references/checklist.md 复核，
 *      再执行 pnpm eslint <改动文件...> --fix && pnpm typecheck && pnpm lint
 *
 * 路由编辑页(字段多/需独立 URL 时)不在生成范围内，照 admin-module-scaffold 的配方 C 手写。
 */
export default function configure(plop) {
  plop.setGenerator('page', {
    description: '生成一个 CRUD 页面(schema + API + 列表页 + 弹窗 + 冒烟用例)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '模块名称(kebab-case，如 user-group):',
        validate: (value) => {
          if (!/^[a-z][a-z0-9-]*$/.test(value))
            return '请输入小写 kebab-case 名称(字母/数字/中划线，字母开头)'
          return true
        },
      },
      {
        type: 'input',
        name: 'domain',
        message: '所属域(对应 src/api/<域> 与 src/views/<域>):',
        default: 'system',
        validate: (value) => {
          if (!/^[a-z][a-z0-9-]*$/.test(value))
            return '请输入小写 kebab-case 域名(字母/数字/中划线，字母开头)'
          return true
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/api/{{domain}}/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/api.hbs',
      },
      {
        type: 'add',
        path: 'src/views/{{domain}}/{{kebabCase name}}/schema.tsx',
        templateFile: 'plop-templates/schema.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/views/{{domain}}/{{kebabCase name}}/index.vue',
        templateFile: 'plop-templates/index.vue.hbs',
      },
      {
        type: 'add',
        path: 'src/views/{{domain}}/{{kebabCase name}}/components/{{pascalCase name}}Modal.vue',
        templateFile: 'plop-templates/modal.vue.hbs',
      },
      {
        type: 'add',
        path: 'e2e/{{kebabCase name}}.spec.ts',
        templateFile: 'plop-templates/spec.hbs',
      },
    ],
  })
}
