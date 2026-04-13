# Changelog & Release History Feature — Implementation Plan

**Date:** 2026-04-06
**Status:** Draft
**Scope:** Backend public API endpoint + Frontend changelog page

---

## 1. Overview

Add a public-facing changelog page to the Mixar website that displays a chronological list of all published releases with their version numbers, dates, severity badges, changelog summaries, and links to full release notes. The data is already stored in the backend's `app_releases` table — we just need a public read-only endpoint and a frontend page to consume it.

### Repositories

| Repo | Local Path | Purpose |
|------|-----------|---------|
| `Mixar-AI/mixar-backend` | `../mixar-backend` (relative to mixie-frontend) | New public changelog API endpoint |
| `Mixar-AI/mixie-frontend` | `.` (this repo) | New changelog page, routing, navbar, API client |

---

## 2. Current State

### Backend — What Already Exists

- **`AppRelease` model** (`modules/updates/models/models.py`):
  - `version` (String 20, unique) — e.g. "1.8.1"
  - `channel` (String 20) — "stable" or "beta"
  - `severity` (String 20) — "optional", "recommended", "important", "critical"
  - `changelog_summary` (Text) — short human-readable changelog
  - `changelog_url` (String) — URL to full changelog (typically GitHub release page)
  - `platforms` (JSON) — `{platform: {s3_key, size_bytes, sha256, installer_type}}`
  - `is_active` (Boolean)
  - `published_at` (DateTime with TZ)
  - `created_at`, `updated_at` (DateTime with TZ)

- **`ReleaseRepository`** (`modules/updates/repositories/repository.py`):
  - `list_releases(page, page_size)` — paginated query, returns `(releases, total_count)`
  - `get_latest_published(channel)` — latest active release for a channel
  - `get_by_version(version)` — single release lookup

- **Admin-only endpoints** (`modules/updates/router.py`):
  - `GET /updates/releases` — paginated list (requires superuser)
  - `GET /updates/releases/{version}` — single release (requires superuser)
  - `POST /updates/releases` — create release (requires superuser)
  - `PATCH /updates/releases/{version}` — update release (requires superuser)

- **Public download endpoints** (`modules/downloads/router.py`):
  - `GET /downloads` — available platforms (public, no auth)
  - `GET /downloads/{platform}` — download URL (public, no auth)

### Frontend — What Already Exists

- **DocsPage** (`src/pages/DocsPage.tsx`) — fully built docs page with sidebar TOC, scroll tracking, styled sections. Uses `PublicNavbar` and `docs.css`.
- **DownloadsPage** (`src/pages/app/DownloadsPage.tsx`) — fetches from `apiClient.getAvailableDownloads()`, displays platform cards. Behind auth.
- **API client** (`src/lib/api-client.ts`) — axios-based, has `getAvailableDownloads()` and `getDownloadUrl()`. No changelog methods.
- **Router** (`src/app/router.tsx`) — React Router v7. Public routes: `/`, `/about`, `/contact`, `/bug-report`, `/docs`, `/pricing`.
- **PublicNavbar** (`src/components/PublicNavbar.tsx`) — `activePage` type is `"about" | "pricing" | "download" | "contact" | "bug-report"`. No changelog link.
- **Styling** — `docs.css` provides a complete design system (sidebar, sections, cards, tables, responsive breakpoints) that the changelog page can reuse.

---

## 3. Backend Changes

### 3.1 New Public Changelog Endpoint

**File:** `modules/updates/router.py` (existing file, add new route)

Add a public (no auth) endpoint:

```
GET /updates/changelog?page=1&page_size=20&channel=stable
```

**Query parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number (1-indexed) |
| `page_size` | int | 20 | Items per page (max 50) |
| `channel` | str | `"stable"` | Filter by release channel |

**Response schema** (new: `ChangelogResponse`):
```json
{
  "status": "success",
  "data": [
    {
      "version": "1.8.1",
      "channel": "stable",
      "severity": "recommended",
      "changelog_summary": "Bug fixes and performance improvements",
      "changelog_url": "https://github.com/Mixar-AI/mixar-texture-painting/releases/tag/v1.8.1",
      "platforms": ["windows", "mac"],
      "published_at": "2026-03-30T15:57:23Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 4
  }
}
```

**Key decisions:**
- **No auth required** — this is a public page like `/docs`
- **Only return `is_active=true` and `published_at IS NOT NULL` releases** — never expose drafts or deactivated releases
- **Flatten `platforms` JSON to a list of platform names** — the frontend only needs to know which platforms a release supports, not S3 keys or SHA256 hashes
- **No download URLs in this response** — keep download flow through the existing `/downloads` endpoints (auth-gated)
- **Order by `published_at` DESC** — newest first

### 3.2 New Response Schema

**File:** `modules/updates/schemas/responses.py` (existing file, add new schema)

Add:
- `ChangelogEntry` — single release item with fields: `version`, `channel`, `severity`, `changelog_summary`, `changelog_url`, `platforms` (list of strings), `published_at`
- `ChangelogResponse` — wraps `data: list[ChangelogEntry]` + `pagination`

### 3.3 Repository Method Update

**File:** `modules/updates/repositories/repository.py` (existing file)

Add a new method or modify `list_releases()`:
- `list_published_releases(channel, page, page_size)` — filters to `is_active=True`, `published_at IS NOT NULL`, ordered by `published_at DESC`
- The existing `list_releases()` is admin-oriented (returns all releases). The new method is public-oriented (only published, safe fields).

### 3.4 Service Layer

**File:** `modules/updates/services/version_service.py` (existing file)

Add method:
- `get_changelog(channel, page, page_size)` — calls repository, transforms `platforms` JSON dict into list of platform name strings, returns structured response

### 3.5 Files to Edit (Backend)

| File (relative to `mixar-backend/`) | Change |
|--------------------------------------|--------|
| `modules/updates/router.py` | Add `GET /updates/changelog` public endpoint |
| `modules/updates/schemas/responses.py` | Add `ChangelogEntry` and `ChangelogResponse` schemas |
| `modules/updates/repositories/repository.py` | Add `list_published_releases()` method |
| `modules/updates/services/version_service.py` | Add `get_changelog()` method |

---

## 4. Frontend Changes

### 4.1 API Client

**File:** `src/lib/api-client.ts`

Add new method:

```typescript
type ChangelogEntry = {
  version: string;
  channel: string;
  severity: string;
  changelog_summary: string | null;
  changelog_url: string | null;
  platforms: string[];
  published_at: string;
};

type ChangelogResponse = {
  status: string;
  data: ChangelogEntry[];
  pagination: { page: number; page_size: number; total: number };
};

async getChangelog(page = 1, pageSize = 20, channel = "stable"): Promise<ChangelogResponse>
```

**Note:** This call must NOT require auth — use a separate axios instance or make the existing one handle unauthenticated requests for this endpoint. Currently `apiClient` attaches a Bearer token on every request. Options:
- The backend should simply ignore/accept missing auth on this endpoint (it's public)
- The existing axios interceptor already handles missing tokens gracefully (requests go through without `Authorization` header if no token is stored) — verify this is the case

### 4.2 Changelog Page Component

**File:** `src/pages/ChangelogPage.tsx` (new file)

A public page at `/changelog` that displays all published releases in a vertical timeline.

**Layout structure:**
- Uses `PublicNavbar` with `activePage="changelog"`
- Reuses `docs.css` for base styling + new `changelog.css` for changelog-specific styles
- Two-column grid layout matching DocsPage: left sidebar with quick-jump version list, right main content with release entries

**Page sections:**

1. **Header**
   - Title: "Changelog"
   - Subtitle: "See what's new in each release of Mixar"

2. **Sidebar — Version Index**
   - Sticky sidebar listing all versions as clickable links (scroll to that release entry)
   - Each entry shows: version number + relative date (e.g. "v1.8.1 — Mar 30")
   - Active version highlighted based on scroll position (same IntersectionObserver pattern as DocsPage)

3. **Main Content — Release Entries**
   - Each release rendered as a card/section with:
     - **Version badge** — e.g. "v1.8.1"
     - **Date** — formatted as "March 30, 2026"
     - **Severity badge** — color-coded pill: green (optional), blue (recommended), orange (important), red (critical)
     - **Channel badge** — only shown if not "stable" (e.g. "beta" tag)
     - **Platform icons** — small icons for windows/mac/linux showing which platforms this release supports
     - **Changelog summary** — the main text body
     - **"View full release notes" link** — opens `changelog_url` in new tab (if present)
   - Entries separated by subtle dividers

4. **Pagination**
   - "Load more" button at the bottom (or infinite scroll — start with button for simplicity)
   - Shows "Showing X of Y releases"

**State management:**
- `useState` for releases array, loading, error, page, hasMore
- `useEffect` on mount to fetch page 1
- Load more appends to existing array
- No React Query needed — simple enough for useState/useEffect (consistent with DocsPage and DownloadsPage patterns)

### 4.3 Changelog Styles

**File:** `src/assets/css/changelog.css` (new file)

Changelog-specific styles that extend the docs design system:

- `.changelog-page` — page wrapper
- `.changelog-layout` — two-column grid (reuse docs-layout dimensions)
- `.changelog-sidebar` — sticky version index
- `.changelog-entry` — individual release card
- `.changelog-version-badge` — version number styling
- `.changelog-severity-badge` — color-coded severity pill
- `.changelog-channel-badge` — beta/stable tag
- `.changelog-platforms` — platform icon row
- `.changelog-summary` — body text
- `.changelog-link` — external link to full notes
- `.changelog-load-more` — pagination button
- Responsive breakpoints matching docs.css (1024px, 768px)

**Design tokens (reuse from existing CSS):**
- Background: `var(--bg)` (black)
- Accent: `var(--accent-teal)`, `var(--accent-green)`
- Gradient: `var(--gradient-primary)`
- Card background: `linear-gradient(145deg, rgba(30, 35, 32, 0.7), rgba(20, 25, 22, 0.8))`
- Border: `rgba(255, 255, 255, 0.06)`
- Text primary: `white`, secondary: `rgba(255, 255, 255, 0.6)`

**Severity badge colors:**
| Severity | Background | Border |
|----------|-----------|--------|
| optional | `rgba(255,255,255, 0.06)` | `rgba(255,255,255, 0.1)` |
| recommended | `rgba(0, 192, 199, 0.12)` | `rgba(0, 192, 199, 0.25)` |
| important | `rgba(251, 191, 36, 0.12)` | `rgba(251, 191, 36, 0.25)` |
| critical | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.25)` |

### 4.4 Router Update

**File:** `src/app/router.tsx`

- Import `ChangelogPage`
- Add public route: `<Route path="/changelog" element={<ChangelogPage />} />`
- Place alongside other public routes (`/docs`, `/about`, etc.)

### 4.5 PublicNavbar Update

**File:** `src/components/PublicNavbar.tsx`

- Extend `activePage` type: add `"changelog"` to the union
- Add "Changelog" link in desktop nav-links (between Pricing and Download)
- Add "Changelog" link in mobile menu (same position)
- Link target: `/changelog`
- No auth guard — visible to everyone

### 4.6 Files to Edit (Frontend)

| File (relative to `mixie-frontend/`) | Change |
|---------------------------------------|--------|
| `src/lib/api-client.ts` | Add `ChangelogEntry` type, `ChangelogResponse` type, `getChangelog()` method |
| `src/pages/ChangelogPage.tsx` | **New file** — full changelog page component |
| `src/assets/css/changelog.css` | **New file** — changelog-specific styles |
| `src/app/router.tsx` | Import ChangelogPage, add `/changelog` route |
| `src/components/PublicNavbar.tsx` | Add "changelog" to activePage type, add nav link |

---

## 5. Implementation Order

### Phase 1: Backend (mixar-backend)

| Step | File | Task |
|------|------|------|
| 1.1 | `modules/updates/schemas/responses.py` | Add `ChangelogEntry` and `ChangelogResponse` Pydantic models |
| 1.2 | `modules/updates/repositories/repository.py` | Add `list_published_releases(channel, page, page_size)` method |
| 1.3 | `modules/updates/services/version_service.py` | Add `get_changelog()` service method that transforms platforms dict to list |
| 1.4 | `modules/updates/router.py` | Add `GET /updates/changelog` endpoint (no auth dependency) |
| 1.5 | — | Test endpoint manually: `curl /api/v1/updates/changelog` |

### Phase 2: Frontend (mixie-frontend)

| Step | File | Task |
|------|------|------|
| 2.1 | `src/lib/api-client.ts` | Add types and `getChangelog()` method |
| 2.2 | `src/assets/css/changelog.css` | Create changelog styles |
| 2.3 | `src/pages/ChangelogPage.tsx` | Build the full page component |
| 2.4 | `src/app/router.tsx` | Add `/changelog` route |
| 2.5 | `src/components/PublicNavbar.tsx` | Add changelog nav link |
| 2.6 | — | Manual testing on local dev server |

---

## 6. Edge Cases & Considerations

### Data quality
- Some releases have `changelog_summary: "No changelog provided."` — display as-is; this is an admin content issue, not a frontend concern
- Some releases may have `changelog_url: null` — hide the "View full release notes" link when null
- Some releases may have empty `platforms` — show the entry but without platform icons

### Empty state
- If no releases exist yet (or API fails), show a friendly empty state message
- Loading state: skeleton cards or a simple spinner (match DownloadsPage pattern)

### Performance
- Page size of 20 is fine — Mixar has ~4 releases total currently, this will scale for years
- No client-side caching needed beyond what the browser provides
- Backend query is indexed on `published_at` via the existing model

### SEO / Public access
- Page is fully public (no auth), accessible at `/changelog`
- Since this is a Vite SPA, SSR/SEO is not a concern (consistent with existing pages like `/docs`)

### Future considerations (NOT in scope)
- Markdown rendering of `changelog_summary` — currently plain text is fine
- Filtering by severity or searching changelogs — not needed until there are many more releases
- RSS feed for changelog — nice-to-have for later
- Linking from DownloadsPage to the current version's changelog entry

---

## 7. Acceptance Criteria

1. Visiting `/changelog` shows a styled page with all published releases, newest first
2. Each release entry displays: version, date, severity badge, platform icons, changelog text, and link to full notes (when available)
3. The sidebar lists all versions and highlights the one in view
4. "Load more" pagination works when there are more than 20 releases
5. PublicNavbar includes a "Changelog" link visible to all users (authenticated and unauthenticated)
6. The page is fully responsive (desktop, tablet, mobile)
7. The backend endpoint returns only published, active releases and does not expose sensitive fields (S3 keys, SHA256, internal notes)
8. The page handles loading, error, and empty states gracefully
