/**
 * Plop 代码生成器
 *
 * 用法: pnpm gen:page <name>   (如 pnpm gen:page user-group)
 *
 * 生成内容(前端):
 *   - src/api/<kebab>/<kebab>.ts       API 封装(列表/创建/更新/删除)
 *   - src/api/<kebab>/index.ts         导出
 *   - src/views/<kebab>/index.vue      列表页(BasicTable + FormQuery + 操作列)
 *   - src/views/<kebab>/components/<Pascal>Modal.vue  新增/编辑弹窗
 *
 * 生成后需手动:
 *   1. 在 typings/system.d.ts 补充 <Pascal> 接口(响应类型暂未接入 OpenAPI 生成)
 *   2. 后端实现对应端点并重新导出 OpenAPI
 *   3. 若需要菜单/权限,在 prisma/initData/menu.ts 与种子中补充
 */
export default function configure(plop) {
  plop.setGenerator('page', {
    description: '生成一个 CRUD 页面(API + 列表页 + 弹窗)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '模块名称(kebab-case,如 user-group):',
        validate: (value) => {
          if (!/^[a-z][a-z0-9-]*$/.test(value))
            return '请输入小写 kebab-case 名称(字母/数字/中划线,字母开头)'
          return true
        },
      },
    ],
    actions: () => [
      {
        type: 'add',
        path: 'src/api/{{kebabCase name}}/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/api.hbs',
      },
      {
        type: 'add',
        path: 'src/api/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/api-index.hbs',
      },
      {
        type: 'add',
        path: 'src/views/{{kebabCase name}}/index.vue',
        templateFile: 'plop-templates/index.vue.hbs',
      },
      {
        type: 'add',
        path: 'src/views/{{kebabCase name}}/components/{{pascalCase name}}Modal.vue',
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
