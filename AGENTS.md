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

使用 TypeScript、Vue Composition API 和 `<script setup>` 编写单文件组件。遵循 `eslint.config.mjs` 中的 `@antfu/eslint-config`，不要额外引入独立格式化规则。Vue 组件使用 PascalCase，组合式函数命名为 `useXxx.ts`，状态模块按领域放在 `src/store/modules/`，接口文件按业务领域放在 `src/api/`。JS/TS 逻辑中优先使用箭头函数，例如 `const handleSubmit = async () => {}`；需要函数提升、构造函数或明确声明式 API 时再使用 `function`。优先使用别名：`@/` 指向 `src/`，`#/` 指向 `typings/`。

## 测试要求

当前项目主要依赖静态校验，未配置前端测试运行器。提交前至少运行 `pnpm typecheck` 和 `pnpm lint`。涉及 UI 的变更需要在浏览器中手动验证受影响页面；布局或交互变化应在 PR 中附截图。

## 提交与 Pull Request 规范

提交信息使用历史中已有的 Conventional Commit 前缀：`feat:`、`fix:`、`refactor:`、`docs:`，或 `fix(notice):` 这类作用域写法。每个提交聚焦一个变更。PR 应包含简短摘要、受影响页面或组件、验证命令，以及可见 UI 变化的截图。

## Agent 专用说明

除非任务要求重新生成类型，否则不要手动编辑 `typings/auto-imports.d.ts` 和 `typings/components.d.ts`。维护 `src/views/system/` 中现有的 schema-driven CRUD 模式，并保持 `src/components/` 中公共组件 API 的兼容性。

新增或修改表单、表格、Modal、抽屉时，优先采用现有公共组件：表单使用 `src/components/Form/` 下的 `BasicForm`、`FormQuery`、`FormEdit`，表格使用 `src/components/Table/` 下的 `BasicTable`，弹窗使用 `src/components/Modal/` 下的 `BasicModal`，抽屉使用 `src/components/Drawer/` 下的 `BasicDrawer`。只有公共组件无法覆盖需求时，才新增局部业务组件，并说明原因。
