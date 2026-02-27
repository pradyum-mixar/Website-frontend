# Landing Page Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the Mixar landing page into mixie-frontend so unauthenticated visitors see it at `/`, while authenticated users are sent directly to `/app`.

**Architecture:** The landing page HTML/CSS/JS is converted into a `LandingPage.tsx` React component with a scoped `landing.css` (all classes prefixed `lp-` to avoid conflicts with the existing global `styles.css`). A `LandingRoute` guard in `guards.tsx` checks auth state and renders either the landing page or redirects to `/app`. The background image is converted to WebP and applied via inline `style` so Vite can hash and cache it correctly.

**Tech Stack:** React 19, React Router v7, TypeScript, Vite, `cwebp` (already installed at `/opt/homebrew/bin/cwebp`), CSS custom properties (project convention — no Tailwind utilities in JSX).

---

## Task 1: Convert Background Image to WebP

**Files:**
- Create: `src/assets/MainBG2.webp`

**Step 1: Run cwebp conversion**

```bash
cwebp -q 85 src/assets/MainBG2.png -o src/assets/MainBG2.webp
```

Expected output: `Saving file 'src/assets/MainBG2.webp'` with file size printed.

**Step 2: Verify output exists and is smaller than the PNG**

```bash
ls -lh src/assets/MainBG2.png src/assets/MainBG2.webp
```

Expected: `.webp` file is smaller than `.png`.

**Step 3: Commit**

```bash
git add src/assets/MainBG2.webp
git commit -m "feat: add WebP version of landing background image"
```

---

## Task 2: Update index.html (SEO, Fonts, Preload)

**Files:**
- Modify: `index.html`

**Step 1: Replace the contents of index.html**

Open `index.html` and replace it entirely with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO -->
    <title>Mixar — The AI Native 3D Editor</title>
    <meta name="description" content="Mixar is the AI-native 3D editor. Create, remix, and share 3D worlds like never before." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Mixar — The AI Native 3D Editor" />
    <meta property="og:description" content="Create, remix, and share 3D worlds with AI-powered tools." />
    <meta property="og:url" content="https://www.mixar.app" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />

    <!-- Fonts: preconnect first, then load -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Verify build still compiles**

```bash
npm run build
```

Expected: build completes with no errors, `dist/` folder created.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add SEO meta tags and Google Fonts to index.html"
```

---

## Task 3: Create landing.css

**Files:**
- Create: `src/assets/css/landing.css`

**Step 1: Create the file with all landing-specific styles**

All class names are prefixed with `lp-` to avoid conflicts with the global `styles.css` (which already defines `.nav`, `.nav-brand`, `.social-links`, etc.).

```css
/* ============================================================
   Landing Page Styles
   All classes prefixed lp- to avoid conflict with styles.css
   ============================================================ */

/* Root element wrapper */
.landing-page {
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    position: relative;
    overflow-x: hidden;
}

/* ── Navigation ─────────────────────────────────────────── */
.lp-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    z-index: 100;
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.8) 0%, transparent 100%);
}

.lp-nav-brand {
    display: flex;
    align-items: center;
    text-decoration: none;
}

.lp-brand-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
}

.lp-nav-links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* "Log In" secondary link */
.lp-nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 100px;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.lp-nav-link:hover {
    background: rgba(255, 255, 255, 0.08);
}

/* "Sign Up" primary CTA */
.lp-nav-cta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 100px;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.lp-nav-cta:hover {
    background: var(--primary-cyan);
    border-color: var(--primary-cyan);
    color: var(--bg-dark);
}

.lp-nav-cta svg {
    transition: transform 0.3s ease;
}

.lp-nav-cta:hover svg {
    transform: translateX(3px);
}

/* ── Hero Tagline ────────────────────────────────────────── */
.lp-hero-tagline {
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
    font-size: 1.25rem;
    font-weight: 300;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
    text-align: center;
    z-index: 5;
    opacity: 0;
    animation: lp-fadeIn 1s ease forwards;
    animation-delay: 0.5s;
}

/* ── Hero Section ────────────────────────────────────────── */
.lp-hero {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    text-align: center;
}

.lp-hero-content {
    opacity: 0;
    transform: translateY(40px);
    animation: lp-fadeUp 1s ease forwards;
    animation-delay: 0.3s;
}

.lp-hero-title {
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
}

.lp-title-line {
    display: block;
}

.lp-title-line.lp-highlight {
    background: linear-gradient(135deg, var(--primary-cyan) 0%, var(--primary-green) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.lp-hero-actions {
    display: flex;
    gap: 1rem;
    margin-top: 3rem;
    opacity: 0;
    transform: translateY(30px);
    animation: lp-fadeUp 1s ease forwards;
    animation-delay: 0.6s;
}

/* ── Waitlist / CTA Button ──────────────────────────────── */
.lp-btn-waitlist {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.lp-btn-waitlist:hover {
    transform: translateY(-2px);
}

.lp-btn-waitlist-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2.5rem;
    font-family: inherit;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--bg-dark);
    background: linear-gradient(135deg, var(--teal) 0%, var(--primary-green) 100%);
    border-radius: 100px;
    box-shadow: 0 4px 20px rgba(0, 192, 199, 0.3);
    transition: all 0.3s ease;
}

.lp-btn-waitlist:hover .lp-btn-waitlist-text {
    box-shadow: 0 8px 30px rgba(0, 192, 199, 0.4);
}

.lp-btn-waitlist-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, var(--primary-cyan) 0%, var(--primary-green) 100%);
    border-radius: 50%;
    color: var(--bg-dark);
    box-shadow: 0 4px 20px rgba(133, 196, 73, 0.3);
    transition: all 0.3s ease;
}

.lp-btn-waitlist:hover .lp-btn-waitlist-arrow {
    box-shadow: 0 8px 30px rgba(133, 196, 73, 0.4);
}

.lp-btn-waitlist-arrow svg {
    transition: transform 0.3s ease;
}

.lp-btn-waitlist:hover .lp-btn-waitlist-arrow svg {
    transform: translateX(3px);
}

/* ── Social Links ────────────────────────────────────────── */
.lp-social-links {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 100px;
    backdrop-filter: blur(10px);
    z-index: 100;
    opacity: 0;
    animation: lp-fadeIn 1s ease forwards;
    animation-delay: 1s;
}

.lp-social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    text-decoration: none;
}

.lp-social-link:hover {
    color: var(--primary-cyan);
    background: rgba(0, 192, 199, 0.1);
}

/* ── Loader ──────────────────────────────────────────────── */
.lp-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.8s ease, visibility 0.8s ease;
}

.lp-loader.lp-loader-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.lp-loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.lp-loader-text {
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    color: var(--primary-cyan);
    min-height: 3rem;
    text-shadow:
        0 0 20px rgba(0, 192, 199, 0.5),
        0 0 40px rgba(0, 192, 199, 0.3),
        0 0 60px rgba(0, 192, 199, 0.1);
    animation: lp-textFadeIn 0.4s ease forwards;
}

/* ── Keyframes ───────────────────────────────────────────── */
@keyframes lp-fadeUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes lp-fadeIn {
    to { opacity: 1; }
}

@keyframes lp-textFadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0px);
    }
}

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
    .lp-nav {
        padding: 1rem 1.5rem;
    }

    .lp-nav-cta,
    .lp-nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }

    .lp-brand-logo {
        height: 32px;
    }

    .lp-hero {
        padding: 4rem 1.5rem;
    }

    .lp-hero-tagline {
        font-size: 1rem;
    }

    .lp-btn-waitlist-text {
        padding: 0.875rem 2rem;
        font-size: 1rem;
    }

    .lp-btn-waitlist-arrow {
        width: 46px;
        height: 46px;
    }

    .lp-social-links {
        bottom: 1rem;
        right: 1rem;
    }
}

@media (max-width: 480px) {
    .lp-hero-title {
        font-size: 2.5rem;
    }

    .lp-hero-tagline {
        font-size: 0.9rem;
    }
}
```

**Step 2: Verify the file saved correctly (no typos in keyframe names)**

```bash
grep "@keyframes" src/assets/css/landing.css
```

Expected output:
```
@keyframes lp-fadeUp {
@keyframes lp-fadeIn {
@keyframes lp-textFadeIn {
```

**Step 3: Commit**

```bash
git add src/assets/css/landing.css
git commit -m "feat: add scoped landing page CSS (lp- prefix)"
```

---

## Task 4: Create LandingPage.tsx

**Files:**
- Create: `src/pages/LandingPage.tsx`

**Step 1: Create the component**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoSrc from "../assets/Logo-Primary_light.png";
import bgSrc from "../assets/MainBG2.webp";
import "../assets/css/landing.css";

const LOADER_MESSAGES = [
  "Unwrapping...",
  "Placing islands...",
  "Generating textures...",
] as const;

function LandingLoader() {
  const [hidden, setHidden] = useState(false);
  const [text, setText] = useState("");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let idx = 0;

    const showNext = () => {
      if (idx < LOADER_MESSAGES.length) {
        setText(LOADER_MESSAGES[idx]);
        setAnimKey((k) => k + 1); // re-trigger CSS animation each message
        idx++;
        setTimeout(showNext, 700);
      } else {
        setTimeout(() => setHidden(true), 500);
      }
    };

    const initial = setTimeout(showNext, 300);
    return () => clearTimeout(initial);
  }, []);

  return (
    <div className={`lp-loader${hidden ? " lp-loader-hidden" : ""}`}>
      <div className="lp-loader-content">
        <p key={animKey} className="lp-loader-text">
          {text}
        </p>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${bgSrc})` }}
    >
      <LandingLoader />

      {/* Navigation */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-brand">
          <img src={logoSrc} alt="Mixar" className="lp-brand-logo" />
        </Link>
        <div className="lp-nav-links">
          <Link to="/auth/login" className="lp-nav-link">
            Log In
          </Link>
          <Link to="/auth/signup" className="lp-nav-cta">
            <span>Sign Up</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Tagline */}
      <p className="lp-hero-tagline">Ride through a new world of 3D</p>

      {/* Hero */}
      <main className="lp-hero">
        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            <span className="lp-title-line">The AI Native</span>
            <span className="lp-title-line lp-highlight">3D Editor.</span>
          </h1>
        </div>

        <div className="lp-hero-actions">
          <Link to="/auth/signup" className="lp-btn-waitlist">
            <span className="lp-btn-waitlist-text">Sign Up</span>
            <span className="lp-btn-waitlist-arrow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </main>

      {/* Social Links */}
      <div className="lp-social-links">
        <a
          href="https://x.com/mixar_app"
          className="lp-social-link"
          aria-label="Twitter / X"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href="https://discord.gg/mixar"
          className="lp-social-link"
          aria-label="Discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
        </a>
        <a
          href="https://linkedin.com/company/mixar"
          className="lp-social-link"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 3: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: add LandingPage React component with animated loader"
```

---

## Task 5: Add LandingRoute Guard and Wire Up Router

**Files:**
- Modify: `src/app/guards.tsx`
- Modify: `src/app/router.tsx`

**Step 1: Add LandingRoute to guards.tsx**

Open `src/app/guards.tsx`. The current file imports `Navigate`, `Outlet`, `useLocation` from react-router-dom and `useAuth`. Add `LandingPage` import and the new guard at the bottom of the file:

Current file (full):
```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading session...</p>;
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { isSuperuser } = useAuth();
  if (!isSuperuser) return <Navigate to="/app" replace />;
  return <Outlet />;
}
```

Replace with:
```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { LandingPage } from "../pages/LandingPage";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading session...</p>;
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { isSuperuser } = useAuth();
  if (!isSuperuser) return <Navigate to="/app" replace />;
  return <Outlet />;
}

/** Shows the landing page to unauthenticated visitors; sends logged-in users to /app. */
export function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Return null during auth init to avoid a flash of the landing page for logged-in users.
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <LandingPage />;
}
```

**Step 2: Update router.tsx**

Open `src/app/router.tsx`. Add `LandingRoute` to the imports and replace the `/` redirect:

Find this line:
```tsx
import { RequireAdmin, RequireAuth } from "./guards";
```

Replace with:
```tsx
import { LandingRoute, RequireAdmin, RequireAuth } from "./guards";
```

Find this route:
```tsx
<Route path="/" element={<Navigate to="/auth/login" replace />} />
```

Replace with:
```tsx
<Route path="/" element={<LandingRoute />} />
```

Also remove the now-unused `Navigate` import if it's no longer used elsewhere. Check the full router — `Navigate` is only used in the removed line, so remove it from the import:

Find:
```tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
```

Replace with:
```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
```

**Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: clean build, no errors.

**Step 4: Commit**

```bash
git add src/app/guards.tsx src/app/router.tsx
git commit -m "feat: wire LandingRoute — unauthenticated / shows landing, authenticated -> /app"
```

---

## Task 6: Smoke Test in Dev Server

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Test unauthenticated landing**

Open `http://localhost:5173/` in a browser (ensure you are logged out / no tokens in localStorage).

Verify:
- [ ] Loader overlay appears with sequential text: "Unwrapping...", "Placing islands...", "Generating textures..."
- [ ] Loader fades out after ~2.5 seconds
- [ ] Background image fills the screen
- [ ] Mixar logo in top-left
- [ ] "Log In" and "Sign Up" buttons in nav
- [ ] Hero title "The AI Native / 3D Editor." with gradient on second line
- [ ] "Sign Up" CTA button in hero center
- [ ] Social links panel bottom-right
- [ ] No console errors

**Step 3: Test nav links**

- Click "Log In" → should navigate to `/auth/login`
- Click "Sign Up" (nav) → should navigate to `/auth/signup`
- Click hero "Sign Up" button → should navigate to `/auth/signup`

**Step 4: Test authenticated redirect**

Log in via `/auth/login`, then navigate to `http://localhost:5173/`.
Expected: immediately redirected to `/app` (no flash of landing page).

**Step 5: Test responsive layout**

Resize browser to mobile width (375px). Verify nav and hero remain readable with no overflow.

---

## Task 7: Final Build Verification and Commit

**Step 1: Run production build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors, no missing module errors.

**Step 2: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4173/` and repeat the smoke test checks from Task 6.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: integrate Mixar landing page — unauthenticated / shows landing, authenticated -> /app"
```

---

## Notes for the Implementer

- **Social link URLs** in `LandingPage.tsx` (Task 4) are placeholder values (`x.com/mixar_app`, `discord.gg/mixar`, `linkedin.com/company/mixar`). Update them to the real URLs before shipping.
- **`teal` CSS variable** — the landing CSS uses `var(--teal)` which is defined in the global `styles.css` `:root`. This is fine since `styles.css` is loaded globally.
- **`background-attachment: fixed`** does not work well on iOS Safari (parallax issue). If this becomes a problem, wrap the background in a pseudo-element approach or remove `fixed` for mobile via a media query.
