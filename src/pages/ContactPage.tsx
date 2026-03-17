import { useState } from "react";
import { PublicNavbar } from "../components/PublicNavbar";
import { apiClient } from "../lib/api-client";
import { ENV } from "../config/env";
import "../assets/css/landing.css";
import "../assets/css/contact.css";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Partnership",
  "Other",
];

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.submitContactForm({ name, email, subject, message });
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
    <div className="contact-page">
      <PublicNavbar activePage="contact" />

      <section className="contact-hero">
        <h1>
          <span className="contact-text-gradient">Get in Touch</span>
        </h1>
        <p>Have a question, idea, or want to partner with us? We'd love to hear from you.</p>
      </section>

      <div className="contact-content">
        {/* Left column — info cards */}
        <div className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-card-header">
              <div className="contact-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <span className="contact-info-card-title">Email</span>
            </div>
            <p className="contact-info-card-text">
              <a href={`mailto:${ENV.CONTACT_EMAIL}`}>{ENV.CONTACT_EMAIL}</a>
            </p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-card-header">
              <div className="contact-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="contact-info-card-title">Discord</span>
            </div>
            <p className="contact-info-card-text">
              Join our community for real-time support and updates.<br />
              <a href="https://discord.gg/YVqvkQx8rX" target="_blank" rel="noopener noreferrer">discord.gg/YVqvkQx8rX</a>
            </p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-card-header">
              <div className="contact-info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <span className="contact-info-card-title">LinkedIn</span>
            </div>
            <p className="contact-info-card-text">
              <a href="https://www.linkedin.com/company/mixar-ai" target="_blank" rel="noopener noreferrer">Mixar AI</a>
            </p>
          </div>
        </div>

        {/* Right column — form */}
        <div className="contact-form-section">
          {success ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <>
              <h2>Send us a message</h2>

              {error && <div className="contact-error">{error}</div>}

              <form className="form" onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    className="form-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject" className="form-label">Subject</label>
                  <select
                    id="contact-subject"
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">Message</label>
                  <textarea
                    id="contact-message"
                    className="form-input"
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={loading || cooldown}
                >
                  {loading ? "Sending..." : cooldown ? "Message Sent" : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
