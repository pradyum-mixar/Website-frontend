import { useState } from "react";
import { PublicNavbar } from "../components/PublicNavbar";
import { apiClient } from "../lib/api-client";
import { ENV } from "../config/env";
import "../assets/css/landing.css";
import "../assets/css/bug-report.css";

export function BugReportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.submitBugReport({
        name,
        email,
        title,
        steps_to_reproduce: stepsToReproduce,
        expected_behavior: expectedBehavior,
      });
      window.gtag?.("event", "bug_report_submit");
      setSuccess(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60_000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bug-report-page">
      <PublicNavbar activePage="bug-report" />

      <section className="bug-report-hero">
        <h1>
          <span className="bug-report-text-gradient">Report a Bug</span>
        </h1>
        <p>Found something that isn't working right? Let us know so we can improve Mixar for everyone.</p>
      </section>

      <div className="bug-report-content">
        {/* Left column — info cards */}
        <div className="bug-report-info">
          <div className="bug-report-info-card bug-report-tip-card">
            <div className="bug-report-info-card-header">
              <div className="bug-report-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <span className="bug-report-info-card-title">Tips for a Good Bug Report</span>
            </div>
            <ul className="bug-report-tip-list">
              <li>Describe the exact steps to trigger the bug</li>
              <li>Include what you expected vs. what actually happened</li>
              <li>Mention your OS, browser, or Mixar app version</li>
              <li>Note if the bug happens every time or intermittently</li>
            </ul>
          </div>

          <div className="bug-report-info-card">
            <div className="bug-report-info-card-header">
              <div className="bug-report-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="bug-report-info-card-title">Discord</span>
            </div>
            <p className="bug-report-info-card-text">
              Need real-time help? Join our Discord community.<br />
              <a href="https://discord.gg/YVqvkQx8rX" target="_blank" rel="noopener noreferrer">discord.gg/YVqvkQx8rX</a>
            </p>
          </div>

          <div className="bug-report-info-card">
            <div className="bug-report-info-card-header">
              <div className="bug-report-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="bug-report-info-card-title">Email</span>
            </div>
            <p className="bug-report-info-card-text">
              <a href={`mailto:${ENV.CONTACT_EMAIL}`}>{ENV.CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>

        {/* Right column — form */}
        <div className="bug-report-form-section">
          {success ? (
            <div className="bug-report-success">
              <div className="bug-report-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Bug Report Submitted!</h3>
              <p>Thanks for helping us improve Mixar. We'll investigate and follow up if needed.</p>
            </div>
          ) : (
            <>
              <h2>Describe the bug</h2>

              {error && <div className="bug-report-error">{error}</div>}

              <form className="form" onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="bug-name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="bug-name"
                    className="form-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bug-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="bug-email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bug-title" className="form-label">Bug Title</label>
                  <input
                    type="text"
                    id="bug-title"
                    className="form-input"
                    placeholder="Brief summary of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bug-steps" className="form-label">Steps to Reproduce</label>
                  <textarea
                    id="bug-steps"
                    className="form-input"
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                    rows={4}
                    value={stepsToReproduce}
                    onChange={(e) => setStepsToReproduce(e.target.value)}
                    required
                    minLength={10}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bug-expected" className="form-label">Expected Behavior</label>
                  <textarea
                    id="bug-expected"
                    className="form-input"
                    placeholder="What should have happened?"
                    rows={3}
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bug-report-submit-btn"
                  disabled={loading || cooldown}
                >
                  {loading ? "Submitting..." : cooldown ? "Report Submitted" : "Submit Bug Report"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
