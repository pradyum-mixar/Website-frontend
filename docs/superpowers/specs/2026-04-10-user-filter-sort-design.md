# User Filter, Sort & Detail View — Admin Dashboard

## Overview

Add filtering, sorting, and expandable row detail to the admin dashboard user list. All filtering and sorting is server-side via the existing `/admin/users` endpoint.

## Backend Change

**Scope:** Add `last_login_at` and `client_version` to `AdminUserItem` response schema.

- `modules/admin/schemas.py` — add `last_login_at: datetime | None` and `client_version: str | None` to `AdminUserItem`
- `modules/admin/router.py` — map both fields from the User model when constructing response items

No other backend changes needed. All filter/sort query params already exist.

## Frontend Changes

All changes in `AdminPage.tsx` and `admin.css`. No new files.

### Search Bar + Collapsible Filters

**Always visible row:**
- Text input — search by name, email, or user number (placeholder text)
- "Filters" toggle button with active filter count badge
- "Clear all" link — only visible when filters are active

**Collapsible filter panel** (below the search row, toggled by "Filters" button):
- Plan — `<select>`: All, Free, Basic, Pro, Enterprise, Trial
- Status — `<select>`: All, Active, Inactive
- Role — `<select>`: All, Admin, Regular
- Credits range — two number inputs: Min / Max

**Behavior:**
- Filters apply immediately on change (no "Apply" button)
- Every filter change resets pagination to page 0
- Matches existing pattern from `DashboardPage.tsx`

### Sortable Column Headers

**Sortable columns (3):** Credits, Generations, Join Date

**Non-sortable columns:** User No, Name/Email, Plan, Status, Role

**Interaction:**
- Click sortable header → sort ascending
- Click again → sort descending
- Click again → remove sort (revert to default `created_at desc`)
- Visual: small arrow (up/down) on active sort column; muted arrow on hover for other sortable headers
- Only one sort active at a time

**Mapping:**
| Column | `sort_by` param |
|---|---|
| Credits | `credits` |
| Generations | `generations_count` |
| Join Date | `created_at` |

**Table stability:** No structural changes to `<table>`. Sortable headers only add `cursor: pointer`, arrow indicator, and hover style.

### Expandable Row Detail

**Trigger:** Click a user row to expand. Click again to collapse. Only one row expanded at a time.

**Expanded area:** Full-width row below the clicked user spanning all columns. Styled with `--bg-card` background.

**Fields shown:**
- Last Login — formatted datetime, or "Never" if null
- Client Version — string, or "Unknown" if null

**No extra API call** — data comes from the list response.

### State Management

All state in React `useState` hooks within `AdminPage`:

| State | Type | Default |
|---|---|---|
| `search` | string | `""` |
| `isFilterOpen` | boolean | `false` |
| `plan` | string | `""` (all) |
| `isActive` | boolean \| null | `null` (all) |
| `isSuperuser` | boolean \| null | `null` (all) |
| `minCredits` | number \| undefined | `undefined` |
| `maxCredits` | number \| undefined | `undefined` |
| `sortBy` | string | `"created_at"` |
| `sortOrder` | string | `"desc"` |
| `expandedUserId` | string \| null | `null` |

Search input is debounced at 300ms before triggering an API call.

### API Integration

All filter/sort state serialized into query params on the existing React Query `useQuery` call:

```
GET /admin/users?skip=0&limit=50&search=...&plan=...&is_active=...&is_superuser=...&min_credits=...&max_credits=...&sort_by=...&sort_order=...
```

`queryKey` includes all filter/sort values so React Query auto-refetches on change.

### Type Change

Add to existing `AdminUser` type:
- `last_login_at?: string`
- `client_version?: string`

## Styling

All new styles in `admin.css`, following existing conventions:
- Dark theme with `--bg-card`, `--border-color`, `--primary-cyan` variables
- Glass-morphism effects consistent with current admin UI
- Responsive — filters stack vertically on mobile
