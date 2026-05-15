import { useState, useEffect, type ReactElement } from "react";
import { apiClient } from "../../lib/api-client";
import { PublicNavbar } from "../../components/PublicNavbar";
import "../../assets/css/landing.css";
import "../../assets/css/dashboard.css";

type PlatformDownload = {
  platform: string;
  version: string;
  size_bytes: number;
  installer_type: string | null;
};

const PLATFORM_META: Record<string, { label: string; subtitle: string; icon: ReactElement }> = {
  windows: {
    label: "Windows",
    subtitle: "Windows 10 or later",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
  },
  mac: {
    label: "macOS",
    subtitle: "macOS 12 Monterey or later",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  linux: {
    label: "Linux",
    subtitle: "Ubuntu 20.04+ / Fedora 36+",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.296 1.884 1.296.598 0 1.05-.269 1.428-.647.178-.268.333-.556.455-.9.073-.2.12-.435.14-.664.025-.267.02-.473-.016-.668a1.793 1.793 0 0 0-.032-.2 8.921 8.921 0 0 0-.144-.533c-.143-.535-.33-.985-.47-1.467-.24-.932-.15-1.651.255-2.382.246-.267.41-.6.583-.985.178-.468.167-.467.167-.735a1.993 1.993 0 0 0-.495-1.267c-.333-.468-.617-.935-.87-1.466-.127-.4-.263-.799-.36-1.2-.096-.4-.16-.868-.1-1.269.05-.4.2-.7.398-1.066a4.3 4.3 0 0 0 .533-1.533c.063-.42.1-.74.1-1.066 0-.335-.036-.535-.103-.869-.135-.737-.447-.866-.682-1.2-.417-.667-.957-1.2-1.507-1.333A3.64 3.64 0 0 0 12.504 0z" />
      </svg>
    ),
  },
};

const PLATFORM_ORDER = ["windows", "mac", "linux"];

function formatSize(bytes: number): string {
  if (bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

export function DownloadsPage() {
  const [platforms, setPlatforms] = useState<PlatformDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getAvailableDownloads()
      .then((res) => setPlatforms(res.data))
      .catch(() => setError("Failed to load downloads"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (platform: string) => {
    setDownloading(platform);
    try {
      const res = await apiClient.getDownloadUrl(platform);
      window.gtag?.("event", "download_click", { platform });
      window.open(res.data.url, "_blank");
    } catch {
      setError(`Download failed for ${platform}`);
    } finally {
      setDownloading(null);
    }
  };

  const sorted = [...platforms].sort(
    (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform)
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #000)" }}>
      <PublicNavbar activePage="download" />

      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Downloads</h1>
            <p className="dashboard-subtitle">Download Mixar for your platform</p>
          </div>

          {loading && <p>Loading available downloads...</p>}
          {error && <p style={{ color: "var(--color-error, #ef4444)" }}>{error}</p>}

          {!loading && !error && sorted.length === 0 && (
            <p>No downloads available at the moment.</p>
          )}

          <div className="downloads-grid">
            {sorted.map((p) => {
              const meta = PLATFORM_META[p.platform];
              if (!meta) return null;

              const sizeStr = formatSize(p.size_bytes);

              return (
                <div className="download-card" key={p.platform}>
                  <div className="download-icon">{meta.icon}</div>
                  <div className="download-info">
                    <h3>{meta.label}</h3>
                    <p>{meta.subtitle}</p>
                    {sizeStr && <p style={{ fontSize: "0.85em", opacity: 0.7 }}>{sizeStr}</p>}
                  </div>
                  <button
                    className="btn-download"
                    onClick={() => handleDownload(p.platform)}
                    disabled={downloading === p.platform}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {downloading === p.platform ? "Loading..." : "Download"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="downloads-book-call">
            <div className="downloads-book-call-text">
              <h3>New to Mixar? We'll help you get set up.</h3>
              <ul>
                <li>Personalized walkthrough for your workflow</li>
                <li>Tips on how to use the agent more effectively</li>
                <li>30 mins, free, no commitment</li>
              </ul>
            </div>
            <a
              href="https://calendly.com/pradyum-mixar/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="downloads-book-call-btn"
            >
              Book a Call
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
