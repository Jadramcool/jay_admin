# 仓库指南

## 项目结构与模块组织

`jdm-admin` 是 Vue 3 + Vite 管理端前端。应用源码位于 `src/`，页面位于 `src/views/`，公共 UI 组件位于 `src/components/`，接口封装位于 `src/api/`，Pinia 状态位于 `src/store/`，路由和守卫位于 `src/router/`，通用工具位于 `src/utils/`。静态文件放在 `public/`，字体和全局 SCSS 放在 `src/assets/`，类型声明位于 `typings/`。

## 构建、测试与开发命令

请在 `jdm-admin/` 目录执行命令。

- `pnpm dev`：启动 Vite 开发服务。
- `pnpm build`：构建生产产物到 `dist/`。
- `pnpm preview`：本地预览生产构建。
- `pnpm typecheck`：执行 `vue-tsc --noEmit`。
- `pnpm lint`：执行 ESLint 检查。
- `pnpm lint:fix`：执行 ESLint 自动修复。

## 编码风格与命名约定

使用 TypeScript、Vue Composition API 和 `<script setup>` 编写单文件组件。遵循 `eslint.config.mjs` 中的 `@antfu/eslint-config`，不要额外引入独立格式化规则。Vue 组件使用 PascalCase，组合式函数命名为 `useXxx.ts`，状态模块按领域放在 `src/store/modules/`，接口文件按业务领域放在 `src/api/`。优先使用别名：`@/` 指向 `src/`，`#/` 指向 `typings/`。

## 测试要求

当前项目主要依赖静态校验，未配置前端测试运行器。提交前至少运行 `pnpm typecheck` 和 `pnpm lint`。涉及 UI 的变更需要在浏览器中手动验证受影响页面；布局或交互变化应在 PR 中附截图。

## 代码完成后的格式化与校验

AI 新增或修改代码后，必须先对本次涉及的代码文件执行 ESLint 自动修复，再进行静态校验。优先使用 `pnpm eslint <文件路径...> --fix` 仅处理本次修改的文件；修改范围较大且确认不会影响无关文件时，可执行 `pnpm lint:fix`。

自动修复完成后，必须依次运行 `pnpm typecheck` 和 `pnpm lint`。不得为了通过格式化或校验而修改与当前任务无关的文件。如果命令因环境限制或仓库原有问题无法通过，必须区分本次变更与原有问题，并在最终回复中明确说明。未执行自动格式化和静态校验时，不得将代码任务标记为完成；确实无法执行时，必须说明原因。

## 提交与 Pull Request 规范

提交信息使用历史中已有的 Conventional Commit 前缀：`feat:`、`fix:`、`refactor:`、`docs:`，或 `fix(notice):` 这类作用域写法。每个提交聚焦一个变更。PR 应包含简短摘要、受影响页面或组件、验证命令，以及可见 UI 变化的截图。

## Agent 专用说明

除非任务要求重新生成类型，否则不要手动编辑 `typings/auto-imports.d.ts` 和 `typings/components.d.ts`。维护 `src/views/system/` 中现有的 schema-driven CRUD 模式，并保持 `src/components/` 中公共组件 API 的兼容性。

新增或修改表单、表格、Modal、抽屉时，优先采用现有公共组件：表单使用 `src/components/Form/` 下的 `BasicForm`、`FormQuery`、`FormEdit`，表格使用 `src/components/Table/` 下的 `BasicTable`，弹窗使用 `src/components/Modal/` 下的 `BasicModal`，抽屉使用 `src/components/Drawer/` 下的 `BasicDrawer`。只有公共组件无法覆盖需求时，才新增局部业务组件，并说明原因。

### 公共组件文档规范

`src/components/` 下供多个业务模块复用的公共组件必须提供固定使用说明。文档统一放在对应组件目录的 `README.md` 中；同一组件族（例如 Form、Table、Modal、Drawer）共用一份文档，并分别说明其公开组件。

新增公共组件时必须同时新增文档；修改公共组件的 Props、Events、Slots、默认行为、暴露方法、组合式函数或使用约束时，必须在同一变更中同步更新文档。未写入文档的内部实现不得作为业务侧依赖的公开 API。

公共组件文档固定包含以下内容：

- 组件用途与适用场景。
- 引入方式和最小可运行示例。
- Props（类型、默认值、是否必填及说明）。
- Events 与回调参数。
- Slots 与作用域参数。
- 暴露方法、配套组合式函数及其返回值。
- 默认行为和关键交互语义，例如表单初始化、重置、提交和校验行为。
- 完整业务示例、注意事项及不推荐用法。

业务页面使用公共组件时，以对应 `README.md` 的示例和约定为准，不得绕过公开 API 操作组件内部状态。文档示例应使用项目既有别名、TypeScript、Composition API 和 `<script setup>`，并保持可直接复制使用。
