# Landing Page Integration Design

**Date:** 2026-02-27
**Status:** Approved
**Source:** `../mixar-landing-standby/`
**Target:** `mixie-frontend` (React 19 + Vite + TypeScript)

---

## Goal

Host the Mixar landing page at `www.mixar.app/`. Unauthenticated users see the landing page; authenticated users are redirected to `/app`. The landing page links to `/auth/login` and `/auth/signup` inside the React SPA.

---

## Routing Architecture

```
/              → LandingRoute (smart gate)
               ├─ isLoading        → null (prevents auth flash)
               ├─ isAuthenticated  → <Navigate to="/app" replace />
               └─ unauthenticated  → <LandingPage />

/auth/login    → LoginPage (unchanged)
/auth/signup   → SignupPage (unchanged)
/auth/*        → other auth pages (unchanged)
/app           → Protected dashboard (unchanged)
```

`LandingRoute` reads from `AuthContext` — same pattern as existing `RequireAuth` guard.

---

## Component Structure

### New files
| File | Purpose |
|------|---------|
| `src/pages/LandingPage.tsx` | Main landing page component + inline `LandingLoader` sub-component |
| `src/assets/css/landing.css` | Scoped CSS adapted from `mixar-landing-standby/styles.css` |

### Modified files
| File | Change |
|------|--------|
| `src/app/router.tsx` | Replace `<Navigate to="/auth/login" />` at `/` with `<LandingRoute />` |
| `src/app/guards.tsx` | Add `LandingRoute` component |
| `index.html` | SEO meta tags, Open Graph, font preconnect, image preload |

### No new assets needed
`src/assets/MainBG2.png` and `src/assets/Logo-Primary_light.png` already exist.

---

## LandingPage Component Design

```
<LandingPage>
  <LandingLoader />       ← overlay, fades out after message sequence
  <nav>
    logo | [Log In] [Sign Up →]
  </nav>
  <p class="hero-tagline">Ride through a new world of 3D</p>
  <main class="hero">
    <h1>The AI Native / 3D Editor.</h1>
    <a href="/auth/signup" class="btn-waitlist">Sign Up →</a>
  </main>
  <div class="social-links">  ← fixed bottom-right
    Twitter/X | Discord | LinkedIn
  </div>
</LandingPage>
```

**LandingLoader** — internal component using `useEffect` + `useState`:
- Sequential messages: "Unwrapping...", "Placing islands...", "Generating textures..."
- 700ms per message, 500ms delay before hide
- Adds `.hidden` class to trigger CSS opacity/visibility transition

---

## CSS Approach

Use a scoped `landing.css` file (imported only in `LandingPage.tsx`) to avoid conflicts with existing global `.nav`, `.nav-brand` classes in `styles.css`. All landing-specific classes prefixed conceptually under the landing component's scope.

Custom `@keyframes` defined in `landing.css`:
- `fadeUp` — hero content entrance
- `fadeIn` — tagline, social links entrance
- `textFadeIn` — loader text entrance with blur

---

## Production Optimizations

1. **WebP image** — convert `MainBG2.png` → `MainBG2.webp` and update CSS to use it (with PNG fallback via `image-set()`)
2. **Font loading** — add `rel="preconnect"` to `fonts.googleapis.com` + `fonts.gstatic.com` in `index.html`
3. **Image preload** — `<link rel="preload" as="image" href="/src/assets/MainBG2.webp">` in `index.html`
4. **SEO meta tags** — `<title>`, `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:image`)
5. **Viewport/mobile** — existing viewport meta is sufficient

---

## Nav Links

- **Logo** — links to `/` (home)
- **Log In** — pill button linking to `/auth/login`
- **Sign Up** — gradient CTA button linking to `/auth/signup`
- **Social links** — placeholder `#` anchors (real URLs to be filled in)
