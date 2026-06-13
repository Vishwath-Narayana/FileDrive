# REDESIGN_CONTEXT.md

Source of truth for the FileDrive frontend redesign. Read this file before
starting any further phase. Do not re-audit the repository or regenerate
architecture reports — update this file instead when something changes.

---

## 1. Final Design System

### 1.1 App Shell Tokens — `frontend/src/index.css` `:root`
Status: ACTIVE. `--border` collision resolved in Phase 1.

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#F7F7F5` | page background (Dashboard, Settings, app shell) |
| `--bg-surface` | `#FFFFFF` | cards, dropdowns, modals |
| `--bg-hover` | `#F0F0EE` | hover states |
| `--border` | `#E8E8E6` | default hairline border (45 usages, fixed Phase1) |
| `--border-strong` | `#D0D0CE` | hover/active border |
| `--text-primary` | `#1A1A1A` | primary text |
| `--text-secondary` | `#6B6B6B` | secondary text |
| `--text-tertiary` | `#A0A0A0` | tertiary/placeholder text |
| `--brand` / `--brand-text` | `#1A1A1A` / `#FFFFFF` | primary button |
| `--success` / `--success-bg` | `#22C55E` / `#F0FDF4` | success states |
| `--warning` / `--warning-bg` | `#F59E0B` / `#FFFBEB` | warning states |
| `--danger` / `--danger-bg` | `#EF4444` / `#FEF2F2` | destructive states |
| `--info` / `--info-bg` | `#3B82F6` / `#EFF6FF` | info states |
| `--border-radius-sm/md/lg/xl` | `6/8/12/16px` | radius scale |
| `--landing-border` | `hsl(0 0% 90%)` | Landing.jsx only (renamed Phase1). Do not reuse elsewhere. |

### 1.2 Auth Page Pattern — Tailwind utility based
Status: canonical for all standalone (no app-shell) pages. Established by
ForgotPassword/ResetPassword/AcceptInvite; rolled out to Login/Register in
Phase 3.

- Page: `min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4`
- Logo header (clickable, links to `/`): `<Link to="/" className="mb-8 text-center block cursor-pointer group">`
  containing `<img className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg transform group-hover:-translate-y-1 transition-all duration-300">`,
  `text-2xl font-bold tracking-tight text-black` title,
  `text-sm text-gray-400 mt-1` subtitle
- Content wrapper: `animate-slide-up w-full max-w-[400px]`
- Card: `bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]`
- Field label: `block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2`
- Inputs: shared `.input-field` class (see 1.3); password fields use `pr-12` + absolute eye-toggle button
- Primary CTA: shared `.btn-primary` + `flex justify-center text-sm group`,
  trailing `<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />`
- Loading spinner: `<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />`
  (Tailwind built-in `animate-spin`, no custom `@keyframes` needed)
- Secondary link row: `mt-8 pt-6 border-t border-[#FAFAFA] text-center`,
  copy in `text-sm text-gray-400`, link `font-bold text-black hover:underline`

### 1.3 Shared component classes — `index.css` `@layer components`
| Class | Purpose |
|---|---|
| `.card-premium` | bordered surface card, hover → border-strong + shadow |
| `.btn-primary` | dark filled button (brand bg/text) |
| `.btn-secondary` | outlined button |
| `.input-field` | text input, 36px height, focus ring |
| `.sidebar-item`, `.sidebar-item-active/-inactive` | sidebar nav rows |
| `.glass-effect` | topbar/sidebar surface |
| `.role-badge`, `.role-badge-admin/-editor/-viewer` | legacy role pill classes — NOT used by ManageOrgModal (uses shared `RoleBadge` component, see 2.2). Orphaned, kept for now. |
| `.skeleton-shimmer` | loading skeleton animation |
| `.premium-tabs`, `.premium-modal` | Bootstrap Tab/Modal overrides |

---

## 2. Shared UI Primitives (`frontend/src/components/`)

### 2.1 `Avatar.jsx` (Phase 2)
Circular initials/image avatar.
Props: `initials, avatarUrl, alt, size=28, fontSize=11, fontWeight=500, background='#E8E8E6', color='var(--text-secondary)', style`
Used by:
- `Topbar.jsx` — defaults (`size=28`), `avatarUrl={user?.avatar}`
- `FileCard.jsx` / `FileRow.jsx` — `size=20 fontSize=10`, initials only
- `ManageOrgModal.jsx` — `size=36 fontSize=14 fontWeight=600 background="#F3F4F6" color="#6B7280"`, initials only

### 2.2 `RoleBadge.jsx` (Phase 2)
Role-colored pill. Props: `role` (`admin|editor|viewer`).
Colors: admin `#EFF6FF`/`#2563EB`/`#BFDBFE`, editor `#FFFBEB`/`#D97706`/`#FDE68A`,
default/viewer `#FFFFFF`/`#6B7280`/`#E5E7EB`.
Used by: `ManageOrgModal.jsx` (member row + role-change dropdown, 2 sites).

---

## 3. Component Inventory (`frontend/src/components/`)

| File | Role | Status |
|---|---|---|
| `Avatar.jsx` | shared primitive | Keep (new, Phase2) |
| `RoleBadge.jsx` | shared primitive | Keep (new, Phase2) |
| `Topbar.jsx` | app shell top bar, org switcher, user menu | Keep, refactored Phase2 |
| `Sidebar.jsx` | app shell nav | Keep, pending Phase4 |
| `FileCard.jsx` | dashboard grid file tile | Keep, refactored Phase2 |
| `FileRow.jsx` | dashboard list file row | Keep, refactored Phase2 |
| `DashboardControls.jsx` | search/sort/view toggle bar | Keep, pending Phase4 |
| `NotificationBell.jsx` | notification dropdown | Keep, Phase1 border-fix only, no Avatar/RoleBadge usage |
| `ManageOrgModal.jsx` | org members/invites/settings modal | Keep, refactored Phase2 |
| `CreateOrgModal.jsx` | create-org modal | Keep, pending Phase4/5 |
| `AdminModal.jsx` | — | **Dead code** — zero imports/renders. Do not touch unless explicitly asked. |

---

## 4. Page Inventory (`frontend/src/pages/`)

| File | Pattern (1.x) | Status |
|---|---|---|
| `Login.jsx` | Auth Page Pattern (1.2) | Migrated Phase3 |
| `Register.jsx` | Auth Page Pattern (1.2) | Migrated Phase3 |
| `ForgotPassword.jsx` | Auth Page Pattern (1.2) | Already conformant — no change |
| `ResetPassword.jsx` | Auth Page Pattern (1.2) | Already conformant — no change |
| `AcceptInvite.jsx` | Auth Page Pattern (1.2), `max-w-[440px]` variant | Already conformant — no change |
| `Dashboard.jsx` | App Shell Tokens (1.1) | Pending Phase4 |
| `Settings.jsx` | App Shell Tokens (1.1) | Pending Phase5 |
| `Landing.jsx` | Own "Landing UI" token set (`--landing-border` etc.) | Out of redesign scope — marketing page |

---

## 5. Migration Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Fix `--border` token collision (index.css, Landing.jsx) | Done |
| 2 | Extract `Avatar`, `RoleBadge` primitives; refactor Topbar/FileCard/FileRow/ManageOrgModal | Done |
| 3 | Unify Login/Register onto Auth Page Pattern (1.2) | Done |
| 4 | App shell + Dashboard restyle (Topbar, Sidebar, DashboardControls, Dashboard.jsx) onto refreshed App Shell Tokens | Pending |
| 5 | Settings restyle + cleanup (remove AdminModal.jsx / App.css if confirmed dead, CreateOrgModal alignment) | Pending |

---

## 6. Constraints (apply to ALL phases)

- Pure presentation-layer redesign. Treat as legacy enterprise system —
  functionality must remain identical.
- No backend, database, auth/authz, API endpoint, route, validation,
  workflow, data model, state-management-architecture, websocket, or
  analytics changes.
- Preserve all props, handlers, state, effects, API calls exactly.
- Allowed: UI structure, styling, shared component extraction, class names,
  design-system alignment.
- Per-phase: read only files listed for that phase. Do not re-scan repo.

---

## 7. Known Dead Code (informational, do not remove unless explicitly asked)

- `frontend/src/components/AdminModal.jsx` — zero imports/renders anywhere.
- `frontend/src/App.css` — zero references anywhere.
