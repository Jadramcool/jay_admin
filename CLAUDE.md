# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**jdm-admin** — A Vue 3 + Naive UI enterprise admin template. Uses a schema-driven approach for CRUD pages, dynamic routing from backend permissions, UnoCSS for atomic utility classes, and SCSS for project-specific styles.

## Commands

```bash
# Development
pnpm dev          # Start dev server (port 4000, proxy to localhost:3000)

# Build
pnpm build        # Production build to dist/

# Type-check
pnpm typecheck    # vue-tsc --noEmit

# Lint (ESLint with @antfu/eslint-config, flat config)
pnpm lint         # Check
pnpm lint:fix     # Fix

# Preview production build
pnpm preview
```

## Environment & Config

- `env/.env` — base env vars (API base `/api`, hash router)
- `env/.env.development` — dev overrides (proxy enabled, port 4000)
- `env/.env.production` — production overrides
- `vite.config.ts` — aliases `@/` → `src/`, `#/` → `typings/`
- `uno.config.ts` — UnoCSS config with rem→px preset + common shortcuts (`wh-full`, `flex-center`, etc.)
- `.npmrc` — `shamefully-hoist=true` (flattened node_modules)
- `.vscode/settings.json` — ESLint as formatter for all file types

## Architecture

### Tech Stack

| Layer      | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Framework  | Vue 3 (Composition API, `<script setup>`)                       |
| UI Library | Naive UI                                                        |
| Styling    | UnoCSS (atomic) + SCSS (variables/global)                       |
| State      | Pinia (with persisted state plugin)                             |
| Router     | Vue Router 4 (hash mode, dynamic routes)                        |
| HTTP       | Axios (with interceptor — token refresh, dedup, error handling) |
| Icons      | @iconify/vue (`icon-park-outline` preset)                       |
| Build      | Vite 6                                                          |
| Lint       | ESLint 10 + @antfu/eslint-config (flat config)                  |

### Directory Structure

```
src/
├── api/                 # API modules, organized by domain (system/, user/)
│   └── system/          # department, menu, role, userManager, operationLog
├── assets/
│   ├── fonts/           # Smiley Sans (得意黑) WOFF2
│   └── styles/          # color.scss (CSS vars), font.scss (@font-face)
├── components/
│   ├── application/     # App shell: NaiveUI provider wrappers + global $message/$dialog
│   ├── common/          # AppCard, AppPage, JIcon
│   ├── Table/           # BasicTable (wraps NDataTable + toolbar + column settings)
│   ├── Form/            # BasicForm, FormQuery, FormEdit (schema-driven)
│   ├── Modal/           # BasicModal (with composable hooks useModal/useModalInner)
│   ├── Drawer/          # BasicDrawer (with composable hooks useDrawer/useDrawerInner)
│   └── Description/     # Description component
├── composables/         # Shared composables
├── constants/           # Constants (options for selects, city data, etc.)
├── directives/
│   └── modules/auth.ts  # v-auth — button-level permission directive
├── layout/
│   ├── index.vue        # Layout resolver (reads route.meta.layout)
│   └── normal/          # Default layout: sider + header + tabs + content + footer
├── router/
│   ├── index.ts         # Router instance (hash or history, via VITE_USE_HASH)
│   ├── basic-routes.ts  # Login, 403, 404, Redirect, catch-all
│   └── guards/
│       ├── index.ts     # Register guards
│       ├── permission-guard.ts  # Auth + dynamic route injection on first load
│       └── page-title-guard.ts  # Set document.title + add tab
├── store/
│   ├── index.ts         # Pinia + persistedstate plugin
│   └── modules/
│       ├── app.ts       # Theme, color mode, font, sidebar collapse, UI toggles
│       ├── auth.ts      # Token storage, login state, logout
│       ├── permission.ts # Dynamic routes, menus, button permissions
│       ├── tab.ts       # Tab bar state (add/close/reorder)
│       ├── user.ts      # Current user info
│       └── componentStore/table.ts  # Per-component table size preference
├── utils/
│   ├── common/          # is/, arrayToTree, renderIcon, hasPermission, schemaUtils
│   ├── http/
│   │   ├── axios.ts     # HttpRequest class (interceptors, refresh token, cancel)
│   │   ├── error-handler.ts
│   │   └── types/       # ResponseModel
│   ├── storage/         # LocalStorage wrapper
│   └── token/           # Token get/set/remove
├── views/
│   ├── login/           # Login page
│   ├── home/            # Dashboard/home
│   ├── settings/        # Settings drawer (reused across layouts)
│   ├── system/          # Admin CRUD pages: user, role, menu, department, operation-log
│   ├── user-center/     # User profile page
│   ├── error/           # 403, 404
│   └── iframe/          # Wrapper for external page embedding
├── main.ts             # Bootstrap: Pinia → Router Guards → Router → Directives → mount
├── App.vue             # Root: NaiveUI config provider (theme/dark/locale) + <router-view>
├── settings.ts         # Font options, theme overrides (light/dark)
└── style.scss          # Global reset, layout CSS vars (light + dark), scrollbar, transitions
```

### Key Patterns

#### Schema-Driven CRUD Pages

Each system management module (user, role, menu, department) follows the same pattern:

1. **`schema.tsx`** — A composable (`useXxxSchema`) that defines all fields in a single `properties` array, each with `table`, `form` (for query), and `editForm` (for modal) configs. Uses JSX for rich rendering (tags, buttons in table cells).
2. **Schema utility functions** in `utils/common/naiveTableSchemaUtils.ts` (`columnsUtil`, `formSchemaUtil`, `editFormSchemaUtil`, `descriptionSchemaUtil`) extract the appropriate sub-config per component type based on field-order arrays.
3. **Page component** uses `<FormQuery>` (search form) + `<BasicTable>` (data table) + `<BasicModal>` (edit/create dialog with `<FormEdit>`).
4. **Data flow**: `BasicTable`'s `:request` function calls the API with pagination/filter params; `FormQuery` provides filters; modals call create/update APIs and emit `@success` to reload.

#### Component Registration Pattern

- `components/index.ts` re-exports all shared components by name.
- `useForm`, `useModal`, `useDrawer` composables use a registration pattern (`@register="register"`) and return both the register callback and action methods. The `<BasicForm>`/`<BasicModal>` emit their internal API on mount, the composable stores it, and calls are proxied through the returned methods object.
- All shared components are auto-imported via `unplugin-vue-components` (see `typings/components.d.ts`).

#### Route Guards & Auth Flow

1. `permission-guard.ts` — `beforeEach` guard handles the entire auth lifecycle:
   - No token → redirect to `/login` (preserving `redirect` query)
   - Has token but no user info → `Promise.all([getUserInfo(), getMenus()])`, then dynamically `router.addRoute()` with backend menus
   - First navigation after adding routes → `replace: true` to re-resolve the target
   - Route not found after auth → 404
2. `page-title-guard.ts` — `afterEach` sets `document.title` and adds visited route to `useTabStore`.

#### HTTP Interceptor (`HttpRequest` class)

- Request interceptor: attaches Bearer token, deduplicates in-flight requests via `AbortController` (cancels previous duplicate)
- Response interceptor: unwraps `ResponseModel` (`data.code` / `data.data`); on 401 → refresh token or clear auth state + redirect to login; error handler shows NaiveUI `$message` notification
- `FormData` requests automatically remove `Content-Type` header (browser sets multipart boundary)

#### Type System

- Global namespaces in `typings/`: `System.*` (Menu, User, Role, Department, OperationLog), `Api.*` (LoginResult, UserInfo, PageParams, PaginatedList), `App.*` (ColorMode, LayoutType, TransitionAnimation)
- Utility types in `typings/global.d.ts`: `Recordable<T>`, `Nullable<T>`, `DeepPartial<T>`
- Env type declarations in `vite-env.d.ts` with full `ImportMetaEnv` interface

#### Dark Mode

- Controlled by `useAppStore.colorMode` (`'light'` | `'dark'` | `'auto'`)
- `App.vue` drives NaiveUI's `darkTheme` via computed, and watches for OS preference changes
- CSS custom properties toggle via `.dark` class on `<html>` (see `style.scss`)
- Uses `document.startViewTransition` API for smooth dark mode transitions (with `prefers-reduced-motion` guard)

#### Theming

- Naive UI theme overrides in `settings.ts` (light + dark).
- Primary color is adjustable (stored in Pinia + persisted), uses `chroma-js` for hover/pressed/suppl variants.
- CSS variables via `setupCssVar()` on `:root` for non-NaiveUI components.
- Font system: 4 options (Smiley Sans / HarmonySans / LXGW WenKai / system default), font family set on both CSS var and NaiveUI theme.
