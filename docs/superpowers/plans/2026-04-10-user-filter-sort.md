# User Filter, Sort & Detail View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side filtering, sorting, and expandable row detail to the admin dashboard user list.

**Architecture:** All filter/sort state lives in React `useState` hooks within `AdminPage`. State is serialized into query params on the existing React Query call. Backend gets a small schema addition (`last_login_at`, `client_version`). No new files — all changes in existing `AdminPage.tsx`, `admin.css`, and two backend files.

**Tech Stack:** React 19, React Query, Axios, Tailwind CSS + custom CSS, FastAPI (backend)

---

### Task 1: Backend — Add `last_login_at` and `client_version` to response

**Files:**
- Modify: `../mixar-backend/modules/admin/schemas.py:26-35`
- Modify: `../mixar-backend/modules/admin/router.py:110-123`

- [ ] **Step 1: Update `AdminUserItem` schema**

In `../mixar-backend/modules/admin/schemas.py`, add three fields to `AdminUserItem`:

```python
class AdminUserItem(BaseModel):
    id: UUID
    user_no: int
    email: str
    is_active: bool
    is_superuser: bool
    credits: int
    name: Optional[str] = None
    generations_count: int
    plan: str = "free"
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    client_version: Optional[str] = None
```

- [ ] **Step 2: Map new fields in router response**

In `../mixar-backend/modules/admin/router.py`, update the `AdminUserItem` construction inside the `for user in users` loop (around line 113):

```python
users_data.append(AdminUserItem(
    id=user.id,
    user_no=user.user_no,
    email=user.email,
    is_active=user.is_active,
    is_superuser=user.is_superuser,
    credits=credit_balance,
    name=user.name,
    generations_count=usage_counts.get(user.id, 0),
    plan=SUBSCRIPTION_TYPE_SLUGS.get(user.subscription_type, "free"),
    created_at=user.created_at,
    last_login_at=user.last_login_at,
    client_version=user.client_version,
))
```

- [ ] **Step 3: Verify backend starts**

Run: `cd ../mixar-backend && python -c "from modules.admin.schemas import AdminUserItem; print(AdminUserItem.model_fields.keys())"`
Expected: Output includes `created_at`, `last_login_at` and `client_version`

- [ ] **Step 4: Commit**

```bash
cd ../mixar-backend
git add modules/admin/schemas.py modules/admin/router.py
git commit -m "feat(admin): add created_at, last_login_at, client_version to user list response"
```

---

### Task 2: Frontend — Update types and wire API query with filter/sort params

**Files:**
- Modify: `src/pages/app/AdminPage.tsx:1-50`

- [ ] **Step 1: Update `AdminUser` type**

Replace the existing `AdminUser` type (lines 7-14) with:

```typescript
type AdminUser = {
  id: string;
  user_no?: number;
  email: string;
  name?: string;
  credits: number;
  is_active: boolean;
  is_superuser: boolean;
  generations_count: number;
  plan: string;
  created_at?: string;
  last_login_at?: string;
  client_version?: string;
};
```

- [ ] **Step 2: Add filter and sort state**

Add these state declarations after the existing `useState` calls (after line 44):

```typescript
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [isFilterOpen, setIsFilterOpen] = useState(false);
const [planFilter, setPlanFilter] = useState("");
const [activeFilter, setActiveFilter] = useState<string>("");
const [roleFilter, setRoleFilter] = useState<string>("");
const [minCredits, setMinCredits] = useState<string>("");
const [maxCredits, setMaxCredits] = useState<string>("");
const [sortBy, setSortBy] = useState("created_at");
const [sortOrder, setSortOrder] = useState("desc");
const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
```

- [ ] **Step 3: Add search debounce effect**

Add this `useEffect` (will need to import `useEffect` from React):

```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(timer);
}, [search]);
```

Update the import on line 2:

```typescript
import { Fragment, useEffect, useState } from "react";
```

- [ ] **Step 4: Add filter reset helper and active filter count**

```typescript
const resetFilters = () => {
  setSearch("");
  setDebouncedSearch("");
  setPlanFilter("");
  setActiveFilter("");
  setRoleFilter("");
  setMinCredits("");
  setMaxCredits("");
  setSortBy("created_at");
  setSortOrder("desc");
  setPage(1);
};

const activeFilterCount = [planFilter, activeFilter, roleFilter, minCredits, maxCredits].filter(Boolean).length;
```

- [ ] **Step 5: Update the `useQuery` call to include all params**

Replace the existing `users` query (lines 46-49):

```typescript
const users = useQuery({
  queryKey: ["admin-users", page, debouncedSearch, planFilter, activeFilter, roleFilter, minCredits, maxCredits, sortBy, sortOrder],
  queryFn: async () => {
    const params = new URLSearchParams({
      skip: String((page - 1) * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (planFilter) params.set("plan", planFilter);
    if (activeFilter) params.set("is_active", activeFilter);
    if (roleFilter) params.set("is_superuser", roleFilter === "true" ? "true" : "false");
    if (minCredits) params.set("min_credits", minCredits);
    if (maxCredits) params.set("max_credits", maxCredits);
    return (await apiClient.instance.get<AdminUsersResponse>(`/admin/users?${params}`)).data;
  },
});
```

- [ ] **Step 6: Reset page to 1 when filters change**

Add an effect that resets pagination when any filter changes:

```typescript
useEffect(() => {
  setPage(1);
}, [debouncedSearch, planFilter, activeFilter, roleFilter, minCredits, maxCredits]);
```

- [ ] **Step 7: Verify app compiles**

Run: `cd /Users/raj/Mixar/Codebase/mixie-frontend && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 8: Commit**

```bash
git add src/pages/app/AdminPage.tsx
git commit -m "feat(admin): wire filter/sort state and API query params"
```

---

### Task 3: Frontend — Search bar and filter toggle UI

**Files:**
- Modify: `src/pages/app/AdminPage.tsx` (inside the Users section JSX, around line 224)
- Modify: `src/assets/css/admin.css`

- [ ] **Step 1: Add search bar and filter toggle markup**

Insert this JSX right after the `<div className="section-header">...</div>` block for the Users section (after line 231, before the `{creditStatus && ...}` block):

```tsx
{/* Search & Filter Bar */}
<div className="admin-filter-bar">
  <div className="admin-search-row">
    <div className="admin-search-input-wrap">
      <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="admin-search-input"
        placeholder="Search by name, email, or user number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <button className="admin-search-clear" onClick={() => setSearch("")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
    <button
      className={`admin-btn admin-btn-secondary admin-filter-toggle${isFilterOpen ? " active" : ""}`}
      onClick={() => setIsFilterOpen(!isFilterOpen)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
      Filters
      {activeFilterCount > 0 && <span className="admin-filter-count">{activeFilterCount}</span>}
    </button>
    {(activeFilterCount > 0 || debouncedSearch) && (
      <button className="admin-clear-all" onClick={resetFilters}>Clear all</button>
    )}
  </div>
</div>
```

- [ ] **Step 2: Add search bar CSS**

Append to `src/assets/css/admin.css`:

```css
/* ─── Filter Bar ─── */
.admin-filter-bar {
    margin-bottom: 1.25rem;
}

.admin-search-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.admin-search-input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.admin-search-icon {
    position: absolute;
    left: 0.85rem;
    color: var(--text-secondary);
    pointer-events: none;
}

.admin-search-input {
    width: 100%;
    padding: 0.65rem 2.25rem 0.65rem 2.5rem;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    outline: none;
    transition: border-color 0.2s ease;
}

.admin-search-input:focus {
    border-color: var(--primary-cyan);
}

.admin-search-input::placeholder {
    color: var(--text-secondary);
}

.admin-search-clear {
    position: absolute;
    right: 0.6rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: color 0.2s;
}

.admin-search-clear:hover {
    color: var(--text-primary);
}

.admin-filter-toggle.active {
    border-color: var(--primary-cyan);
    color: var(--primary-cyan);
}

.admin-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 700;
    background: var(--primary-cyan);
    color: var(--bg-dark);
}

.admin-clear-all {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
    transition: color 0.2s;
}

.admin-clear-all:hover {
    color: var(--primary-cyan);
}
```

- [ ] **Step 3: Add responsive CSS for search bar**

Append inside the existing `@media (max-width: 768px)` block in `admin.css`:

```css
    .admin-search-row {
        flex-wrap: wrap;
    }

    .admin-search-input-wrap {
        width: 100%;
    }
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Search bar and Filters button appear above the user table. Typing in search triggers API calls (visible in network tab). Filter count badge shows 0 (no filters active).

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/AdminPage.tsx src/assets/css/admin.css
git commit -m "feat(admin): add search bar and filter toggle UI"
```

---

### Task 4: Frontend — Collapsible filter panel

**Files:**
- Modify: `src/pages/app/AdminPage.tsx` (inside the filter bar JSX)
- Modify: `src/assets/css/admin.css`

- [ ] **Step 1: Add filter panel markup**

Insert this JSX right after the closing `</div>` of `.admin-search-row` (still inside `.admin-filter-bar`):

```tsx
{isFilterOpen && (
  <div className="admin-filter-panel">
    <div className="admin-filter-field">
      <label className="admin-ops-label">Plan</label>
      <select className="admin-ops-input" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
        <option value="">All</option>
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
        <option value="trial">Trial</option>
      </select>
    </div>
    <div className="admin-filter-field">
      <label className="admin-ops-label">Status</label>
      <select className="admin-ops-input" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
    <div className="admin-filter-field">
      <label className="admin-ops-label">Role</label>
      <select className="admin-ops-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="">All</option>
        <option value="true">Admin</option>
        <option value="false">Regular</option>
      </select>
    </div>
    <div className="admin-filter-field">
      <label className="admin-ops-label">Min Credits</label>
      <input
        type="number"
        className="admin-ops-input"
        placeholder="0"
        min={0}
        value={minCredits}
        onChange={(e) => setMinCredits(e.target.value)}
      />
    </div>
    <div className="admin-filter-field">
      <label className="admin-ops-label">Max Credits</label>
      <input
        type="number"
        className="admin-ops-input"
        placeholder="Any"
        min={0}
        value={maxCredits}
        onChange={(e) => setMaxCredits(e.target.value)}
      />
    </div>
  </div>
)}
```

- [ ] **Step 2: Add filter panel CSS**

Append to `src/assets/css/admin.css`:

```css
/* ─── Filter Panel ─── */
.admin-filter-panel {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    backdrop-filter: blur(20px);
}

.admin-filter-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.admin-filter-field .admin-ops-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}
```

- [ ] **Step 3: Add responsive CSS for filter panel**

Append inside the existing `@media (max-width: 768px)` block:

```css
    .admin-filter-panel {
        flex-wrap: wrap;
    }

    .admin-filter-field {
        flex: 1 1 calc(50% - 0.5rem);
        min-width: 120px;
    }
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Clicking "Filters" reveals the filter panel with 5 controls. Changing any filter triggers a new API call and resets to page 1. Filter count badge updates. "Clear all" resets everything.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/AdminPage.tsx src/assets/css/admin.css
git commit -m "feat(admin): add collapsible filter panel"
```

---

### Task 5: Frontend — Update table columns and add sortable headers

**Files:**
- Modify: `src/pages/app/AdminPage.tsx` (table thead and tbody)
- Modify: `src/assets/css/admin.css`

- [ ] **Step 1: Add sort handler function**

Add this before the `return` statement in `AdminPage`:

```typescript
const handleSort = (field: string) => {
  if (sortBy === field) {
    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      // Third click: reset to default
      setSortBy("created_at");
      setSortOrder("desc");
    }
  } else {
    setSortBy(field);
    setSortOrder("asc");
  }
};

const SortArrow = ({ field }: { field: string }) => {
  if (sortBy !== field) return null;
  return (
    <span className="admin-sort-arrow">
      {sortOrder === "asc" ? "\u25B2" : "\u25BC"}
    </span>
  );
};
```

- [ ] **Step 2: Replace the table header**

Replace the existing `<thead>` block (lines 251-257):

```tsx
<thead>
  <tr>
    <th>User</th>
    <th>Plan</th>
    <th className="admin-th-sortable" onClick={() => handleSort("credits")}>
      Credits <SortArrow field="credits" />
    </th>
    <th className="admin-th-sortable" onClick={() => handleSort("generations_count")}>
      Generations <SortArrow field="generations_count" />
    </th>
    <th>Status</th>
    <th>Role</th>
    <th className="admin-th-sortable" onClick={() => handleSort("created_at")}>
      Joined <SortArrow field="created_at" />
    </th>
    <th style={{ textAlign: "right" }}>Actions</th>
  </tr>
</thead>
```

- [ ] **Step 3: Replace the table body rows**

Replace the existing row content inside `{userList.map((user) => (...))}` — the `<Fragment>` and its children (lines 261-341). Replace with:

```tsx
<Fragment key={user.id}>
  <tr
    className={`admin-user-row${expandedUserId === user.id ? " expanded" : ""}`}
    onClick={(e) => {
      // Don't toggle expand when clicking buttons/inputs
      if ((e.target as HTMLElement).closest("button, input")) return;
      setExpandedUserId(expandedUserId === user.id ? null : user.id);
    }}
  >
    <td>
      <div className="user-info">
        <div className="user-avatar-small">
          {user.name
            ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
            : user.email.split("@")[0].substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="user-name">{user.name || "\u2014"}</div>
          <div className="user-email">
            {user.user_no ? `#${user.user_no} \u00B7 ` : ""}{user.email}
          </div>
        </div>
      </div>
    </td>
    <td>
      <span className={`admin-plan-badge ${user.plan}`}>{user.plan}</span>
    </td>
    <td>
      <span className="admin-credit-badge">{user.credits}</span>
    </td>
    <td>{user.generations_count ?? 0}</td>
    <td>
      {user.is_active
        ? <span className="status-badge active">Active</span>
        : <span className="status-badge inactive">Inactive</span>}
    </td>
    <td>
      {user.is_superuser
        ? <span className="admin-badge">Admin</span>
        : <span className="status-badge active">User</span>}
    </td>
    <td>
      {user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "\u2014"}
    </td>
    <td style={{ textAlign: "right" }}>
      <button
        className={`admin-btn admin-btn-sm ${editingUserId === user.id ? "admin-btn-secondary" : "admin-btn-primary"}`}
        onClick={() => {
          if (editingUserId === user.id) {
            setEditingUserId(null);
          } else {
            setEditingUserId(user.id);
            setCreditAmount(100);
            setCreditReason("admin_grant");
            setCreditStatus(null);
          }
        }}
      >
        {editingUserId === user.id ? "Cancel" : "Add Credits"}
      </button>
    </td>
  </tr>
  {editingUserId === user.id && (
    <tr className="admin-credit-edit-row">
      <td colSpan={8}>
        <div className="admin-inline-credit-form">
          <div className="admin-ops-field">
            <label className="admin-ops-label">Amount</label>
            <input
              type="number"
              min={1}
              className="admin-ops-input"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
            />
          </div>
          <div className="admin-ops-field" style={{ flex: 2 }}>
            <label className="admin-ops-label">Reason</label>
            <input
              className="admin-ops-input"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="e.g. admin_grant"
            />
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            style={{ alignSelf: "flex-end" }}
            onClick={() => grantCredits.mutate()}
            disabled={grantCredits.isPending}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            {grantCredits.isPending ? "Adding..." : "Confirm"}
          </button>
        </div>
      </td>
    </tr>
  )}
</Fragment>
```

Note: `colSpan` changed from `4` to `8` to match the new column count.

- [ ] **Step 4: Add sortable header and plan badge CSS**

Append to `src/assets/css/admin.css`:

```css
/* ─── Sortable Headers ─── */
.admin-th-sortable {
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
}

.admin-th-sortable:hover {
    color: var(--primary-cyan);
}

.admin-sort-arrow {
    font-size: 0.65rem;
    margin-left: 0.3rem;
    color: var(--primary-cyan);
}

/* ─── User Row ─── */
.admin-user-row {
    cursor: pointer;
    transition: background 0.15s;
}

.admin-user-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.admin-user-row.expanded {
    background: rgba(0, 192, 199, 0.03);
}

/* ─── Plan Badge ─── */
.admin-plan-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
}

.admin-plan-badge.pro {
    background: rgba(0, 192, 199, 0.12);
    color: var(--primary-cyan);
}

.admin-plan-badge.enterprise {
    background: rgba(133, 196, 73, 0.12);
    color: var(--primary-green);
}

.admin-plan-badge.trial {
    background: rgba(251, 191, 36, 0.12);
    color: #fbbf24;
}

.admin-plan-badge.basic {
    background: rgba(139, 92, 246, 0.12);
    color: #a78bfa;
}

/* ─── Status Badge Inactive ─── */
.status-badge.inactive {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}
```

- [ ] **Step 5: Verify visually**

Run: `npm run dev`
Expected: Table now shows 8 columns (User, Plan, Credits, Generations, Status, Role, Joined, Actions). Clicking Credits/Generations/Joined headers toggles sort. Plan badges are color-coded. User number shows in the email subtitle.

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/AdminPage.tsx src/assets/css/admin.css
git commit -m "feat(admin): add new table columns and sortable headers"
```

---

### Task 6: Frontend — Expandable row detail

**Files:**
- Modify: `src/pages/app/AdminPage.tsx` (inside the user row Fragment)
- Modify: `src/assets/css/admin.css`

- [ ] **Step 1: Add expanded detail row markup**

Insert this JSX right after the credit edit row `{editingUserId === user.id && (...)}` block, still inside the `<Fragment>`:

```tsx
{expandedUserId === user.id && (
  <tr className="admin-detail-row">
    <td colSpan={8}>
      <div className="admin-detail-content">
        <div className="admin-detail-item">
          <span className="admin-detail-label">Last Login</span>
          <span className="admin-detail-value">
            {user.last_login_at
              ? new Date(user.last_login_at).toLocaleString(undefined, {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })
              : "Never"}
          </span>
        </div>
        <div className="admin-detail-item">
          <span className="admin-detail-label">Client Version</span>
          <span className="admin-detail-value">{user.client_version || "Unknown"}</span>
        </div>
      </div>
    </td>
  </tr>
)}
```

- [ ] **Step 2: Add expanded detail CSS**

Append to `src/assets/css/admin.css`:

```css
/* ─── Expandable Detail Row ─── */
.admin-detail-row td {
    padding: 0 !important;
}

.admin-detail-content {
    display: flex;
    gap: 2.5rem;
    padding: 0.85rem 1.25rem;
    background: rgba(0, 192, 199, 0.02);
    border-top: 1px solid rgba(0, 192, 199, 0.08);
    border-bottom: 1px solid rgba(0, 192, 199, 0.08);
}

.admin-detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.admin-detail-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.admin-detail-value {
    font-size: 0.85rem;
    color: var(--text-primary);
}
```

- [ ] **Step 3: Add responsive CSS for detail row**

Append inside the existing `@media (max-width: 768px)` block:

```css
    .admin-detail-content {
        flex-wrap: wrap;
        gap: 1rem;
    }
```

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Clicking a user row expands a detail section below showing Last Login and Client Version. Clicking the same row again collapses it. Clicking a different row switches the expansion. Clicking the "Add Credits" button does NOT trigger expand/collapse.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/AdminPage.tsx src/assets/css/admin.css
git commit -m "feat(admin): add expandable row detail with last login and client version"
```

---

### Task 7: Final verification and cleanup

**Files:**
- All modified files

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify the complete flow**

Run: `npm run dev`
Manual checks:
- Search by name, email, user number — all work
- Filter by plan, status, role, credit range — all apply
- Active filter count badge updates correctly
- "Clear all" resets everything
- Sortable headers cycle through asc → desc → default
- Sort arrow indicators display correctly
- Row click expands/collapses detail view
- "Add Credits" button works without triggering expand
- Pagination works with active filters
- Table is visually stable — no layout shifts

- [ ] **Step 3: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "feat(admin): user filter, sort, and detail view complete"
```
