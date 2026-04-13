import { useEffect, useMemo, useState, type ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PublicNavbar } from "../components/PublicNavbar";
import { apiClient, type ChangelogEntry } from "../lib/api-client";
import "../assets/css/landing.css";
import "../assets/css/changelog.css";

const PAGE_SIZE = 20;

const SEVERITY_LABELS: Record<string, string> = {
  optional: "Optional",
  recommended: "Recommended",
  important: "Important",
  critical: "Critical",
};

const PLATFORM_ICONS: Record<string, ReactElement> = {
  windows: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Windows">
      <title>Windows</title>
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  mac: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="macOS">
      <title>macOS</title>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  linux: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Linux">
      <title>Linux</title>
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.296 1.884 1.296.598 0 1.05-.269 1.428-.647.178-.268.333-.556.455-.9.073-.2.12-.435.14-.664.025-.267.02-.473-.016-.668a1.793 1.793 0 0 0-.032-.2 8.921 8.921 0 0 0-.144-.533c-.143-.535-.33-.985-.47-1.467-.24-.932-.15-1.651.255-2.382.246-.267.41-.6.583-.985.178-.468.167-.467.167-.735a1.993 1.993 0 0 0-.495-1.267c-.333-.468-.617-.935-.87-1.466-.127-.4-.263-.799-.36-1.2-.096-.4-.16-.868-.1-1.269.05-.4.2-.7.398-1.066a4.3 4.3 0 0 0 .533-1.533c.063-.42.1-.74.1-1.066 0-.335-.036-.535-.103-.869-.135-.737-.447-.866-.682-1.2-.417-.667-.957-1.2-1.507-1.333A3.64 3.64 0 0 0 12.504 0z" />
    </svg>
  ),
};

function formatLongDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function scrollToVersion(version: string) {
  document
    .getElementById(`release-${version}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ChangelogPage() {
  const [releases, setReleases] = useState<ChangelogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string>("");

  // Fix sticky sidebar: same workaround as DocsPage
  useEffect(() => {
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflowX = "clip";
    return () => {
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    apiClient
      .getChangelog(1, PAGE_SIZE)
      .then((res) => {
        setReleases(res.data.releases);
        setTotal(res.data.total);
        setPage(1);
      })
      .catch(() => setError("Failed to load changelog"))
      .finally(() => setLoading(false));
  }, []);

  // Track which release is in view as the user scrolls
  useEffect(() => {
    if (releases.length === 0) return;

    const handleScroll = () => {
      let current = "";
      for (const r of releases) {
        const el = document.getElementById(`release-${r.version}`);
        if (el && el.getBoundingClientRect().top <= 160) {
          current = r.version;
        }
      }
      setActiveVersion(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [releases]);

  const hasMore = useMemo(() => releases.length < total, [releases.length, total]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await apiClient.getChangelog(nextPage, PAGE_SIZE);
      setReleases((prev) => [...prev, ...res.data.releases]);
      setTotal(res.data.total);
      setPage(nextPage);
    } catch {
      setError("Failed to load more releases");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="changelog-page">
      <PublicNavbar activePage="changelog" />

      <div className="changelog-layout">
        {/* ── Sidebar ── */}
        <aside className="changelog-sidebar-cell">
          <nav className="changelog-sidebar">
            <p className="changelog-sidebar-title">Releases</p>
            {releases.map((r) => (
              <button
                key={r.version}
                className={`changelog-sidebar-link${activeVersion === r.version ? " active" : ""}`}
                onClick={() => scrollToVersion(r.version)}
              >
                <span className="changelog-sidebar-link-version">v{r.version}</span>
                <span className="changelog-sidebar-link-date">{formatShortDate(r.published_at)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="changelog-content">
          <div className="changelog-header">
            <p className="changelog-header-label">Release Notes</p>
            <h1>Changelog</h1>
            <p className="changelog-header-description">
              See what's new in every release of Mixar — features, improvements, and fixes,
              ordered from newest to oldest.
            </p>
          </div>

          {loading && <p className="changelog-state">Loading changelog...</p>}

          {error && !loading && (
            <p className="changelog-state changelog-state-error">{error}</p>
          )}

          {!loading && !error && releases.length === 0 && (
            <p className="changelog-state">No releases published yet.</p>
          )}

          {releases.map((r) => (
            <article
              key={r.version}
              id={`release-${r.version}`}
              className="changelog-entry"
            >
              <header className="changelog-entry-header">
                <span className="changelog-version-badge">v{r.version}</span>
                <span className="changelog-entry-date">{formatLongDate(r.published_at)}</span>

                <div className="changelog-entry-meta">
                  {r.channel !== "stable" && (
                    <span className="changelog-channel-badge">{r.channel}</span>
                  )}
                  <span className={`changelog-severity-badge ${r.severity}`}>
                    {SEVERITY_LABELS[r.severity] ?? r.severity}
                  </span>
                  {r.platforms.length > 0 && (
                    <span className="changelog-platforms">
                      {r.platforms.map((p) => PLATFORM_ICONS[p]).filter(Boolean)}
                    </span>
                  )}
                </div>
              </header>

              {r.release_notes ? (
                <div className="changelog-markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {r.release_notes}
                  </ReactMarkdown>
                </div>
              ) : r.changelog_summary ? (
                <p className="changelog-summary">{r.changelog_summary}</p>
              ) : (
                <p className="changelog-summary-empty">No changelog provided for this release.</p>
              )}
            </article>
          ))}

          {!loading && !error && releases.length > 0 && (
            <div className="changelog-load-more-row">
              {hasMore && (
                <button
                  className="changelog-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              )}
              <span className="changelog-load-more-count">
                Showing {releases.length} of {total} {total === 1 ? "release" : "releases"}
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
