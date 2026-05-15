import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/* ============================================================================
 * Mixar landing redesign — middle sections, between the existing hero & footer.
 * Sourced from the Claude Design handoff bundle (Site.jsx). Adapted to React/TSX
 * with reversible scroll reveals so the smooth scroll runs in both directions.
 * ========================================================================= */

const ink = "#f4f4f1";
const dim = "#9a9a93";
const dim2 = "#5a5a55";
const rule = "#1f1d1a";
const surface = "#14110d";
const teal = "#2abc99";
const accent = "#80bf49";
const grad =
  "linear-gradient(90deg,#80bf49 0%,#67be5f 22%,#2abc99 70%,#00bbc2 100%)";
const mono = "ui-monospace,'JetBrains Mono','SF Mono',Menlo,Consolas,monospace";

/* ── Reversible reveal hook ──
 * Adds .in when the target enters the viewport, removes it when it leaves.
 * This makes the entrance animation play again on scroll-up.
 */
function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) el.classList.add("in");
          else el.classList.remove("in");
        });
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "article" | "h2" | "h3" | "p" | "ul" | "li";
  className?: string;
  style?: CSSProperties;
  slow?: boolean;
  scale?: boolean;
  stagger?: boolean;
  threshold?: number;
};

function Reveal({
  children,
  as: Tag = "div",
  className = "",
  style,
  slow,
  scale,
  stagger,
  threshold,
}: RevealProps) {
  const ref = useReveal<HTMLDivElement>(threshold);
  const cls = [
    "rd-reveal",
    slow && "rd-reveal-slow",
    scale && "rd-reveal-scale",
    stagger && "rd-reveal-stagger",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  // The ref type is HTMLDivElement but we render various tags. Using `as`
  // forces a cast which is fine for ref purposes since all extend HTMLElement.
  return (
    <Tag ref={ref as never} className={cls} style={style}>
      {children}
    </Tag>
  );
}

/* ── Scroll Y tracker (raf-throttled) ── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isMobile;
}

/* ── Scroll scene ──
 * Wraps a section so its root element fades/scales/blurs/translates in as it
 * enters the viewport and out as it leaves. Driven by scroll position so the
 * effect is reversible — scrolling back up plays it in reverse.
 *
 * `travel` is the section's progress 0..1 from "just below viewport" to "just
 * above viewport". 0..0.18 is the entry zone, 0.82..1 is the exit zone, in
 * between the section sits at its rest pose.
 */
function useScrollScene<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 720px), (pointer: coarse)").matches) return;

    const content =
      sec.querySelector<HTMLElement>(":scope > .rd-container, :scope > .rd-wave-content") ||
      sec;

    // Flatten grid/group/stagger containers so each individual heading line,
    // card, principle, list item gets its own staggered animation instead of
    // animating as one big block.
    const GROUP_CLASSES = [
      "rd-system-grid",
      "rd-mixie-grid",
      "rd-bb-grid",
      "rd-cases-grid",
      "rd-cases-subhead",
      "rd-principle-list",
      "rd-wave-row",
      "rd-walkthrough-cta",
      "rd-reveal-stagger",
    ];
    const isGroup = (el: HTMLElement) =>
      GROUP_CLASSES.some((c) => el.classList.contains(c));
    const expand = (el: HTMLElement): HTMLElement[] => {
      if (isGroup(el)) {
        return Array.from(el.children).flatMap((c) =>
          expand(c as HTMLElement),
        );
      }
      return [el];
    };
    const items: HTMLElement[] = Array.from(content.children).flatMap((c) =>
      expand(c as HTMLElement),
    );

    items.forEach((it) => {
      it.style.willChange = "opacity, transform, filter";
      // Suppress the existing CSS transitions on .rd-reveal so they don't fight
      // the per-frame inline updates. !important beats the stylesheet selector.
      it.style.setProperty("transition", "none", "important");
      it.setAttribute("data-rd-scene-item", "");
    });

    // Background parallax targets (orbs, overlays, etc.) move at a different
    // rate to the foreground so the section feels layered with depth.
    const bg = Array.from(
      sec.querySelectorAll<HTMLElement>(
        ":scope > .rd-system-bg, :scope > .rd-cta-bg, :scope > .rd-wave-bg, :scope > .rd-wave-overlay",
      ),
    );
    bg.forEach((b) => {
      b.style.willChange = "transform";
    });

    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    // Two independent timelines per item: an entry cascade and an exit cascade.
    // The entry cascade fires as the section's *centre* crosses up through the
    // bottom half of the viewport. The exit cascade fires as the centre crosses
    // up through the top half. The two never overlap, so there is a clean
    // moment in the middle where every item sits at app = 1 and the section is
    // fully readable.
    const N = items.length;
    const STAGGER_ENTRY = 0.05;
    const STAGGER_EXIT = 0.05;
    const ENTRY_RANGE = Math.max(0.2, 1 - (N - 1) * STAGGER_ENTRY);
    const EXIT_RANGE = Math.max(0.2, 1 - (N - 1) * STAGGER_EXIT);

    const state = items.map(() => 0);
    const poseState = items.map(() => 1);
    const hoverState = items.map(() => 0);
    const hoverTarget = items.map(() => 0);
    const isHoverCard = (item: HTMLElement) =>
      [
        "rd-bb-card",
        "rd-use-card",
      ].some((className) => item.classList.contains(className));
    const hoverHandlers = items.map((item, i) => {
      if (!isHoverCard(item)) return null;
      const onEnter = () => {
        hoverTarget[i] = 1;
      };
      const onLeave = () => {
        hoverTarget[i] = 0;
      };
      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);
      return { item, onEnter, onLeave };
    });
    // Lower lerp = slower easing toward target = animation feels more
    // deliberate / less skittish as the user scrolls past.
    const LERP = 0.11;
    const POSE_LERP = 0.13;
    const HOVER_LERP = 0.18;

    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const secRect = sec.getBoundingClientRect();
      const secTop = secRect.top;

      // Centre-based with a deliberate STABLE plateau in the middle of the
      // viewport. Entry climbs to 1 as the section's centre approaches the
      // upper third; exit stays at 0 until the centre passes the lower
      // third. The gap between those bounds is the reading window — every
      // item sits at app = 1 for that entire ~30% of viewport travel.
      const center = secTop + secRect.height / 2;
      const STABLE_TOP = vh * 0.65; // entry reaches 1 here
      const STABLE_BOTTOM = vh * 0.35; // exit starts ramping here
      const entryFraction = clamp01((vh - center) / (vh - STABLE_TOP));
      const exitFraction = clamp01((STABLE_BOTTOM - center) / STABLE_BOTTOM);

      items.forEach((item, i) => {
        const entry_i = clamp01(
          (entryFraction - i * STAGGER_ENTRY) / ENTRY_RANGE,
        );
        // Top items exit first — index 0 has zero delay, last item is held
        // back the full delay. Mirrors the visual reading order of a section
        // scrolling up out of frame.
        const exit_i = clamp01(
          (exitFraction - i * STAGGER_EXIT) / EXIT_RANGE,
        );
        const targetRaw = entry_i * (1 - exit_i);
        const target = smoothstep(Math.max(0, Math.min(1, targetRaw)));
        const entryPose = 1 - smoothstep(entry_i);
        const exitPose = smoothstep(exit_i);
        const poseTarget = entryPose - exitPose;

        state[i] += (target - state[i]) * LERP;
        poseState[i] += (poseTarget - poseState[i]) * POSE_LERP;
        const app = state[i];
        const pose = poseState[i];

        const slideY = pose * 170;
        const slideX = Math.abs(pose) * 65 * (i % 2 === 0 ? -1 : 1);
        hoverState[i] += (hoverTarget[i] - hoverState[i]) * HOVER_LERP;
        const offscreen = Math.min(1, Math.abs(pose));
        const scale = (1 - offscreen * 0.18) * (1 + hoverState[i] * 0.018);
        const blur = offscreen * 16;
        const rot = offscreen * 4 * (i % 2 === 0 ? 1 : -1) * (pose < 0 ? -1 : 1);

        item.style.opacity = String(app);
        item.style.transform = `translate3d(${slideX}px, ${slideY}px, 0) scale(${scale}) rotate(${rot}deg)`;
        item.style.filter = `blur(${blur}px)`;
      });

      // Parallax bg layers — keyed off the centre offset for slow drift.
      const centerOffset = (vh * 0.5 - center) / vh;
      bg.forEach((b, idx) => {
        const speed = 70 + idx * 40;
        b.style.transform = `translate3d(0, ${centerOffset * speed}px, 0)`;
      });

      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      items.forEach((it) => {
        it.style.willChange = "";
        it.style.transition = "";
      });
      hoverHandlers.forEach((handler) => {
        if (!handler) return;
        handler.item.removeEventListener("mouseenter", handler.onEnter);
        handler.item.removeEventListener("mouseleave", handler.onLeave);
      });
      bg.forEach((b) => {
        b.style.willChange = "";
      });
    };
  }, []);
  return ref;
}

/* ── Section progress (0..1 as a section travels through the viewport) ──
 * Polls via requestAnimationFrame each frame so it works even if a smooth-
 * scroll library batches/swallows native scroll events.
 */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, rect.height - vh);
      const passed = -rect.top;
      const v = Math.max(0, Math.min(1, passed / total));
      if (Math.abs(v - last) > 0.001) {
        last = v;
        setP(v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref]);
  return p;
}

function Btn({
  children,
  primary,
  ghost,
  href = "#",
  onClick,
}: {
  children: ReactNode;
  primary?: boolean;
  ghost?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={`rd-btn ${primary ? "rd-btn-primary" : ghost ? "rd-btn-ghost" : "rd-btn-default"}`}
    >
      {children}
    </a>
  );
}

/* ── 1. WALKTHROUGH ── */
function useWalkthroughCursor() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const frame = frameRef.current;
    const cursor = cursorRef.current;
    if (!frame || !cursor) return;

    let mx = -1000;
    let my = -1000;
    let cx = -1000;
    let cy = -1000;
    let active = false;

    const show = () => {
      if (!active) {
        active = true;
        cursor.classList.add("is-active");
        // Snap to mouse on first activation so it doesn't sweep in from the
        // last known position.
        cx = mx;
        cy = my;
      }
    };
    const hide = () => {
      if (active) {
        active = false;
        cursor.classList.remove("is-active");
      }
    };

    const pointInFrame = (x: number, y: number) => {
      const r = frame.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const onWindowMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (pointInFrame(mx, my)) show();
      else hide();
    };

    const iframe = frame.querySelector<HTMLIFrameElement>("iframe");
    let iframeDoc: Document | null = null;
    let injectedStyle: HTMLStyleElement | null = null;

    const onIframeMove = (e: MouseEvent) => {
      if (!iframe) return;
      const r = iframe.getBoundingClientRect();
      // The iframe's mousemove gives client coords inside the iframe doc;
      // translate them back into the parent viewport.
      mx = r.left + e.clientX;
      my = r.top + e.clientY;
      show();
    };
    const onIframeLeave = () => hide();

    let wheelRaf = 0;
    let wheelDeltaX = 0;
    let wheelDeltaY = 0;
    const flushIframeWheel = () => {
      wheelRaf = 0;
      const dx = wheelDeltaX;
      const dy = wheelDeltaY;
      wheelDeltaX = 0;
      wheelDeltaY = 0;

      const w = window as unknown as {
        __lenis?: { scrollTo: (target: number, opts?: object) => void };
      };
      if (w.__lenis) {
        w.__lenis.scrollTo(window.scrollY + dy, { immediate: true, force: true });
      } else {
        window.scrollBy({ top: dy, left: dx, behavior: "auto" });
      }
    };

    const onIframeWheel = (e: WheelEvent) => {
      // Wheel events inside the iframe never reach the parent window, so
      // forward them immediately. Animating every wheel tick with Lenis makes
      // this area feel laggy, especially on trackpads.
      e.preventDefault();
      const multiplier =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      wheelDeltaX += e.deltaX * multiplier;
      wheelDeltaY += e.deltaY * multiplier;
      if (!wheelRaf) {
        wheelRaf = requestAnimationFrame(flushIframeWheel);
      }
    };

    const attachInsideIframe = () => {
      try {
        const doc = iframe?.contentDocument;
        if (!doc) return;
        iframeDoc = doc;
        injectedStyle = doc.createElement("style");
        injectedStyle.textContent =
          "*, *::before, *::after { cursor: none !important; }";
        doc.head.appendChild(injectedStyle);
        doc.addEventListener("mousemove", onIframeMove);
        doc.addEventListener("mouseleave", onIframeLeave);
        doc.addEventListener("wheel", onIframeWheel, { passive: false });
      } catch {
        // cross-origin iframe — skip silently
      }
    };
    iframe?.addEventListener("load", attachInsideIframe);
    if (iframe?.contentDocument?.readyState === "complete") attachInsideIframe();

    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("blur", hide);

    let raf = 0;
    const LERP = 0.14; // intentionally slower than 1:1 so the reticle "follows"
    const tick = () => {
      cx += (mx - cx) * LERP;
      cy += (my - cy) * LERP;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("blur", hide);
      iframe?.removeEventListener("load", attachInsideIframe);
      if (iframeDoc) {
        iframeDoc.removeEventListener("mousemove", onIframeMove);
        iframeDoc.removeEventListener("mouseleave", onIframeLeave);
        iframeDoc.removeEventListener("wheel", onIframeWheel);
        if (injectedStyle && injectedStyle.parentNode) {
          injectedStyle.parentNode.removeChild(injectedStyle);
        }
      }
    };
  }, []);
  return { frameRef, cursorRef };
}

export function Walkthrough() {
  const { frameRef, cursorRef } = useWalkthroughCursor();
  return (
    <section id="walkthrough" className="rd-section rd-section-walkthrough">
      <div className="rd-container">
        <Reveal stagger className="rd-walkthrough-header">
          <h2 className="rd-h2">
            Click through the
            <br />
            <em>Mixar workflow.</em>
          </h2>
          <p className="rd-lead">
            A guided preview of how Mixar feels in motion — five steps you can
            drive yourself.
          </p>
        </Reveal>

        <Reveal slow className="rd-walkthrough-frame">
          <div ref={frameRef} className="rd-walkthrough-cursor-target">
            <iframe
              src="/assets/redesign/walkthrough.html"
              title="Mixar walkthrough"
              allow="autoplay"
              loading="lazy"
            />
            <div className="rd-chip rd-chip-tl">PROTOTYPE · 5 STEPS</div>
          </div>
        </Reveal>

        <Reveal className="rd-walkthrough-cta">
          <div>
            <div className="rd-cta-title">Ready to actually use it?</div>
            <div className="rd-cta-sub">
              Mixar runs natively on Mac, Windows, and Linux.
            </div>
          </div>
          <div className="rd-btn-row">
            <Btn primary href="/downloads">Download Mixar →</Btn>
            <Btn href="/docs">Read the docs</Btn>
          </div>
        </Reveal>
      </div>
      <div ref={cursorRef} className="rd-walk-cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="rd-walk-cursor-play">
          <polygon points="9,6 9,18 19,12" />
        </svg>
      </div>
    </section>
  );
}

/* ── 2. SCROLLY — six surfaces ──
 * Use local MP4s where possible so the browser can stream video instead of
 * downloading heavy animated GIFs up front.
 */
const CHAPTERS = [
  {
    id: "agent",
    num: "01",
    word: "Agent",
    gif: "/assets/redesign/videos/moodboard.mp4",
    title: "Background agents that finish what you started.",
    copy:
      "Dispatch Mixie to unwrap, bake, retopologize, or generate while you keep moving. The grunt work runs in the background — you stay in the flow.",
    spec: ["Multi-task", "Non-blocking"],
  },
  {
    id: "focus",
    num: "02",
    word: "Focus",
    gif: "/assets/redesign/videos/focus.mp4",
    title: "Less UI. More work.",
    copy:
      "A single-pane mode that hides panels, menus, and chrome — leaving you, your scene, and your agents. Pure flow, no toolbar tax.",
    spec: ["Zen mode", "One pane"],
  },
  {
    id: "scene",
    num: "03",
    word: "Scene",
    gif: "/assets/redesign/videos/scene.mp4",
    title: "From prompt to populated scene.",
    copy:
      "Brief a full scene — a warehouse, a booth, a cave — and the agent assembles it. Generated props, placed by spatial logic, styled to your moodboard. You direct the room; Mixar builds it.",
    spec: ["Multi-asset", "Moodboard-aware"],
  },
  {
    id: "mood",
    num: "04",
    word: "Mood",
    gif: "/assets/redesign/videos/mood.mp4",
    title: "The canvas your scenes are built from.",
    copy:
      "Pin references, paste palettes, set the visual language — and Mixar's scene generation reads from it. The moodboard isn't a separate tab; it's the brief your agents follow.",
    spec: ["Drives scene gen", "2D + 3D"],
  },
  {
    id: "models",
    num: "05",
    word: "Models",
    gif: "/assets/redesign/imagery/models-grid.png",
    title: "Powered by the best models in 3D.",
    copy:
      "One license, one workflow, every model. Mixar brings together the leading models for assets, textures, and image generation — and adds the pipeline work that makes their output actually usable.",
    spec: ["Hunyuan 3D · Tripo", "Meshy · Flux"],
  },
];

const WHITE_PANEL_CHAPTER_IDS = new Set(["focus", "scene", "mood"]);

export function Scrolly() {
  const isMobile = useIsMobile();
  const wrapRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const p = useScrollProgress(wrapRef);
  const activeF = p * CHAPTERS.length;
  const active = Math.min(CHAPTERS.length - 1, Math.floor(activeF));
  const localP = Math.max(0, Math.min(1, activeF - active));
  const activeChapter = CHAPTERS[active];
  const hasWhitePanel = WHITE_PANEL_CHAPTER_IDS.has(activeChapter.id);

  useEffect(() => {
    if (isMobile || !activeChapter.gif.endsWith(".mp4")) return;

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;

      if (id === activeChapter.id) {
        video.play().catch(() => {
          // Muted autoplay can still be blocked by browser settings.
        });
      } else {
        video.pause();
      }
    });
  }, [activeChapter, isMobile]);

  if (isMobile) {
    return (
      <section className="rd-section rd-section-scrolly rd-scrolly-mobile-section">
        <div className="rd-container">
          <div className="rd-scrolly-mobile-head">
            <h2 className="rd-h2 rd-h2-small">
              Five things <span className="rd-em-grad">Mixar</span> does that
              Blender can't.
            </h2>
          </div>

          <div className="rd-scrolly-mobile-list">
            {CHAPTERS.map((c) => (
              <article key={c.id} className="rd-scrolly-mobile-card">
                <div
                  className={`rd-scrolly-mobile-media ${WHITE_PANEL_CHAPTER_IDS.has(c.id) ? "rd-scrolly-white-surface" : ""}`}
                >
                  {c.gif.endsWith(".mp4") ? (
                    <video
                      className={WHITE_PANEL_CHAPTER_IDS.has(c.id) ? "rd-scrolly-inset-media" : undefined}
                      src={c.gif}
                      aria-hidden="true"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={c.gif}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className={
                        c.id === "models" ? "rd-scrolly-models-img" : ""
                      }
                    />
                  )}
                </div>
                <div className="rd-scrolly-mobile-body">
                  <div className="rd-scrolly-counter">
                    <span>
                      {c.num} / 0{CHAPTERS.length}
                    </span>
                    <span className="rd-counter-rule" />
                  </div>
                  <h3 className="rd-scrolly-title">{c.title}</h3>
                  <p className="rd-scrolly-copy">{c.copy}</p>
                  <div className="rd-spec-row">
                    {c.spec.map((s) => (
                      <span key={s} className="rd-spec-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapRef}
      className="rd-section rd-section-scrolly"
      style={{ height: `${CHAPTERS.length * 65}vh` }}
    >
      <div className="rd-scrolly-sticky">
        <div className="rd-scrolly-progress-bar">
          <div
            className="rd-scrolly-progress-fill"
            style={{ width: `${p * 100}%` }}
          />
          {CHAPTERS.map((c, i) =>
            i === 0 ? null : (
              <span
                key={c.id}
                className="rd-scrolly-progress-tick"
                style={{ left: `${(i / CHAPTERS.length) * 100}%` }}
              />
            ),
          )}
        </div>

        <div className="rd-scrolly-grid">
          {/* LEFT: rail */}
          <div className="rd-scrolly-rail">
            <div className="rd-scrolly-rail-label rd-scrolly-rail-top">
              SCROLL
            </div>
            {CHAPTERS.map((c, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <div key={c.id} className="rd-rail-step">
                  <div
                    className={`rd-rail-dot ${isActive ? "is-active" : isPast ? "is-past" : ""}`}
                  >
                    {isActive && (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        className="rd-rail-progress"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="10"
                          fill="none"
                          stroke={teal}
                          strokeWidth="1.4"
                          strokeDasharray={`${localP * 62.8} 62.8`}
                        />
                      </svg>
                    )}
                    <span className="rd-rail-num">{c.num}</span>
                  </div>
                  <span className="rd-rail-word">{c.word}</span>
                </div>
              );
            })}
            <div className="rd-scrolly-rail-label rd-scrolly-rail-bottom">
              {String(active + 1).padStart(2, "0")}/
              {String(CHAPTERS.length).padStart(2, "0")}
            </div>
          </div>

          {/* CENTER: media */}
          <div
            className={`rd-scrolly-video ${hasWhitePanel ? "rd-scrolly-white-surface" : ""}`}
          >
            <div className="rd-scrolly-vignette" />
            {CHAPTERS.map((c, i) => {
              const isActive = i === active;
              const dir = i < active ? -1 : 1;
              const hasInsetMedia = WHITE_PANEL_CHAPTER_IDS.has(c.id);
              const motionTransform = isActive
                ? `translate3d(${(1 - localP) * -2}%, 0, 0) scale(${1 + localP * 0.04})`
                : `translate3d(${dir * 6}%, 0, 0) scale(1.08)`;
              const transform =
                hasInsetMedia ? `translate(-50%, -50%) ${motionTransform}` : motionTransform;
              return c.gif.endsWith(".mp4") ? (
                <video
                  key={c.id}
                  className={hasInsetMedia ? "rd-scrolly-inset-media" : undefined}
                  ref={(el) => {
                    videoRefs.current[c.id] = el;
                  }}
                  src={c.gif}
                  aria-hidden="true"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload={isActive ? "auto" : "metadata"}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform,
                  }}
                />
              ) : (
                <img
                  key={c.id}
                  src={c.gif}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className={c.id === "models" ? "rd-scrolly-models-img" : ""}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? `translate3d(${(1 - localP) * -2}%, 0, 0) scale(${1 + localP * 0.04})`
                      : `translate3d(${dir * 6}%, 0, 0) scale(1.08)`,
                  }}
                />
              );
            })}
            <div className="rd-scrolly-bigword">
              {activeChapter.word}.
            </div>
            <div className="rd-scrolly-rec">
              <span className="rd-rec-pulse" />
              REC · {activeChapter.num}
            </div>
            <div
              className="rd-scrolly-keepscrolling"
              style={{ opacity: active === 0 ? 1 - localP : 0 }}
            >
              KEEP SCROLLING
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                <rect
                  x="0.5"
                  y="0.5"
                  width="13"
                  height="21"
                  rx="6.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line
                  x1="7"
                  y1="5"
                  x2="7"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <animate
                    attributeName="y2"
                    values="9;13;9"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </line>
              </svg>
            </div>
          </div>

          {/* RIGHT: text panel */}
          <div className="rd-scrolly-text">
            <div className="rd-scrolly-text-head">
              <h2 className="rd-h2 rd-h2-small">
                Five things <span className="rd-em-grad">Mixar</span> does
                <br />
                that Blender can't.
              </h2>
            </div>

            <div className="rd-scrolly-text-body">
              {CHAPTERS.map((c, i) => {
                // Each chapter's text fades, slides, scales and blurs IN at
                // the start of its scroll window and back OUT near the end,
                // mirroring the section-level scroll animation used in the
                // rest of the page.
                const IN = 0.18;
                const OUT = 0.82;
                let fade = 0;
                let yOff = 0;
                let scale = 1;
                let blur = 0;
                if (i === active) {
                  if (localP < IN) {
                    const t = localP / IN; // 0..1 entering
                    fade = t;
                    yOff = (1 - t) * 60;
                    scale = 0.92 + t * 0.08;
                    blur = (1 - t) * 10;
                  } else if (localP > OUT) {
                    const t = (localP - OUT) / (1 - OUT); // 0..1 exiting
                    fade = 1 - t;
                    yOff = -t * 60;
                    scale = 1 - t * 0.08;
                    blur = t * 10;
                  } else {
                    fade = 1;
                  }
                } else {
                  yOff = i < active ? -60 : 60;
                  blur = 10;
                  scale = 0.92;
                }
                return (
                <div
                  key={c.id}
                  className="rd-scrolly-text-slide"
                  style={{
                    opacity: fade,
                    transform: `translate3d(0, ${yOff}px, 0) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  <div className="rd-scrolly-counter">
                    <span>
                      0{i + 1} / 0{CHAPTERS.length}
                    </span>
                    <span className="rd-counter-rule" />
                  </div>
                  <h3 className="rd-scrolly-title">{c.title}</h3>
                  <p className="rd-scrolly-copy">{c.copy}</p>
                  <div className="rd-spec-row">
                    {c.spec.map((s) => (
                      <span key={s} className="rd-spec-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>

            <div className="rd-scrolly-chapters">
              <div className="rd-scrolly-chapters-label">CHAPTERS</div>
              <div className="rd-scrolly-chapters-grid">
                {CHAPTERS.map((c, i) => (
                  <div key={c.id} className="rd-chapter-cell">
                    <div
                      className="rd-chapter-bar"
                      style={{
                        background:
                          i < active
                            ? teal
                            : i === active
                              ? "rgba(42,188,153,0.3)"
                              : "rgba(244,244,241,0.1)",
                      }}
                    >
                      {i === active && (
                        <div
                          className="rd-chapter-bar-fill"
                          style={{ width: `${localP * 100}%` }}
                        />
                      )}
                    </div>
                    <div
                      className="rd-chapter-word"
                      style={{ color: i <= active ? ink : dim2 }}
                    >
                      {c.word}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3. SYSTEM — built to assist, not replace ── */
function Principle({
  n,
  t,
  c,
}: {
  n: string;
  t: string;
  c: string;
}) {
  return (
    <div className="rd-principle">
      <div className="rd-principle-head">
        <span className="rd-principle-n">{n}</span>
        <h3 className="rd-principle-title">{t}</h3>
      </div>
      <p className="rd-principle-copy">{c}</p>
    </div>
  );
}

export function System() {
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section
      ref={sceneRef}
      id="system"
      className="rd-section rd-section-system rd-scene"
    >
      <div className="rd-system-bg" />
      <div className="rd-container">
        <Reveal>
          <h2 className="rd-h-display">
            Built to <em>assist,</em> not replace.
            <br />
            <span className="rd-h-payoff">You stay in the chair.</span>
          </h2>
          <p className="rd-lead rd-lead-wide">
            Mixie suggests. <em className="rd-em-ink">You decide.</em> Every
            step is yours to accept, edit, or throw out.
          </p>
        </Reveal>

        <div className="rd-system-grid">
          <Reveal slow>
            <div className="rd-control-video">
              <video
                src="/assets/redesign/videos/control.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          </Reveal>

          <Reveal stagger className="rd-principle-list">
            <Principle
              n="01"
              t="Plan Mode when you want it."
              c="Turn on Plan Mode and every Mixie action becomes a proposal you review before it lands. Off by default — on when the stakes are yours."
            />
            <Principle
              n="02"
              t="Your tools still work."
              c="Native Blender keymap, native modifiers, native shortcuts. Mixar runs on the muscle memory you already have."
            />
            <Principle
              n="03"
              t="Your file, your rules."
              c="Mixie matches your naming, hierarchy, and conventions — not the other way around."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 4. MEET MIXIE ── */
export function MeetMixie() {
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section
      ref={sceneRef}
      id="mixie"
      className="rd-section rd-section-mixie rd-scene"
    >
      <div className="rd-container rd-mixie-grid">
        <Reveal stagger>
          <h2 className="rd-h2">
            Brief Mixie
            <br />
            <em className="rd-em-grad">
              like you'd brief
              <br />
              a 3d Artist.
            </em>
          </h2>
          <p className="rd-lead">
            Plain language in, real work out. Mixie reads your scene —
            topology, materials, units, conventions — proposes a plan, and
            executes once you sign off.
          </p>
        </Reveal>

        <Reveal scale slow>
          <div className="rd-mixie-panel">
            <div className="rd-mixie-panel-head">
              <span className="rd-mixie-dot-amber" />
              <span className="rd-mixie-dot-teal" />
              <span className="rd-mixie-panel-title">
                Mixie · Cave Scene v3
              </span>
              <span className="rd-mixie-panel-steps">14 STEPS</span>
            </div>
            <div className="rd-mixie-bubbles">
              <div className="rd-bubble">
                <div className="rd-bubble-meta">YOU · 09:14</div>
                <div className="rd-bubble-body">
                  Distribute UV islands across UDIM tiles by material type.
                </div>
              </div>
              <div className="rd-bubble rd-bubble-mixie">
                <div className="rd-bubble-meta">MIXIE · 09:14</div>
                <div className="rd-bubble-body">
                  Splitting 142 islands → 6 UDIMs by material group. Estimating
                  bake budget.
                </div>
                <div className="rd-bubble-tags">
                  {[
                    "rock_amber",
                    "rock_dark",
                    "moss_wet",
                    "metal_rusted",
                    "water_caustic",
                    "particle_dust",
                  ].map((t) => (
                    <span key={t} className="rd-bubble-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rd-bubble">
                <div className="rd-bubble-meta">YOU · 09:15</div>
                <div className="rd-bubble-body">
                  Bake at 4K with a 4-pixel margin. Wood first.
                </div>
              </div>
              <div className="rd-bubble rd-bubble-mixie">
                <div className="rd-bubble-meta">MIXIE · 09:15</div>
                <div className="rd-bubble-body">
                  Queued 4K bake — wood layer routed to Cycles · ETA 1m 14s.
                </div>
              </div>
            </div>
            <div className="rd-mixie-input">
              <span className="rd-mixie-input-pill">∞ Agent</span>
              <span className="rd-mixie-input-placeholder">
                Describe your next step…
              </span>
              <span className="rd-mixie-input-send">↑</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 5. BLENDER, BUT BETTER ── */
const BB_CARDS: Array<{
  t: string;
  d: string;
  img: string;
  imagePosition?: string;
  imageFit?: string;
}> = [
  {
    t: "Per-task workspaces",
    d: "Each workspace is a purpose-built workbench — not a layout preset. The texturing room has stencil painting, the UV room has live island packing, the modelling room has retopo overlays.",
    img: "workspace-new.png",
    imagePosition: "center top",
  },
  {
    t: "Layer-based texturing",
    d: "Stack PBR effects with masks, blend modes, procedural inputs. Like Photoshop for materials — and Mixie can paint a layer for you that you can still edit by hand.",
    img: "layers-card.jpg",
    imageFit: "contain",
  },
  {
    t: "Moodboard in-canvas",
    d: "No more bouncing to Pinterest. Generate references, pin style anchors, prompt scene changes — inside the editor, with the work.",
    img: "moodboard-card.jpg",
  },
];

export function BlenderBetter() {
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section ref={sceneRef} className="rd-section rd-section-bb rd-scene">
      <div className="rd-container">
        <Reveal stagger className="rd-bb-head">
          <h2 className="rd-h2 rd-h2-dark">
            Blender, but <em>better.</em>
          </h2>
        </Reveal>
        <Reveal stagger className="rd-bb-grid">
          {BB_CARDS.map((c, i) => (
            <article key={c.t} className="rd-bb-card">
              <div
                className="rd-bb-card-img"
                style={{
                  backgroundImage: `url(/assets/redesign/imagery/${c.img})`,
                  backgroundPosition: c.imagePosition ?? "center",
                  backgroundSize: c.imageFit ?? "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="rd-bb-card-body">
                <div className="rd-bb-card-n">0{i + 1} / 03</div>
                <h3 className="rd-bb-card-title">{c.t}</h3>
                <p className="rd-bb-card-copy">{c.d}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ── 6. USE CASES ── */
function UseCard({
  img,
  title,
  outcome,
  position = "center",
}: {
  img: string;
  title: string;
  outcome: string;
  position?: string;
}) {
  return (
    <article className="rd-use-card">
      <div
        className="rd-use-card-img"
        style={{
          background: `url(/assets/redesign/imagery/${img}) ${position}/cover`,
        }}
      />
      <div className="rd-use-card-body">
        <h4 className="rd-use-card-title">{title}</h4>
        <p className="rd-use-card-outcome">{outcome}</p>
      </div>
    </article>
  );
}

export function UseCases() {
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section
      ref={sceneRef}
      id="cases"
      className="rd-section rd-section-cases rd-scene"
    >
      <div className="rd-container">
        <Reveal stagger className="rd-cases-head">
          <h2 className="rd-h2">
            Who's building
            <br />
            with Mixar.
          </h2>
          <p className="rd-lead">
            Two audiences picked it up first. Studios shipping interactive work,
            and teams making space.
          </p>
        </Reveal>

        <Reveal className="rd-cases-subhead">
          <h3>Creative teams</h3>
          <span>Render · Animate · Ship</span>
        </Reveal>
        <Reveal stagger className="rd-cases-grid rd-cases-grid-5">
          <UseCard
            img="indie-studio.jpg"
            title="Indie game studios"
            outcome="From concept to engine-ready prop in an afternoon."
          />
          <UseCard
            img="technical-artists.jpg"
            title="Technical artists"
            outcome="UVs, retopo, bakes — scripted in plain language."
          />
          <UseCard
            img="environment.jpg"
            title="Concept & environment"
            outcome="Mood, block-in, lookdev on one timeline."
          />
          <UseCard
            img="character-artist.jpg"
            title="Character artists"
            outcome="Auto-rig and pose-by-prompt, ready for engine."
            position="center top"
          />
          <UseCard
            img="solo-artists.jpg"
            title="Solo creators"
            outcome="A whole pipeline that fits on one machine."
          />
        </Reveal>

        <Reveal className="rd-cases-subhead">
          <h3>Industry & spatial design</h3>
          <span>Plan · Visualize · Walk</span>
        </Reveal>
        <Reveal stagger className="rd-cases-grid rd-cases-grid-4">
          <UseCard
            img="exhibition.jpg"
            title="Event & exhibition"
            outcome="Booth, stage, and floor plans, lit and walkable."
          />
          <UseCard
            img="interior.jpg"
            title="Architecture & interiors"
            outcome="Brief a room. Get massing, materials, and a view."
          />
          <UseCard
            img="warehousing.jpg"
            title="Warehouse & facility"
            outcome="Rapid layouts with collision-aware placement."
          />
          <UseCard
            img="real-estate.jpg"
            title="Real estate concepting"
            outcome="Concept-grade visualizations in minutes, not weeks."
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ── 7. RIDE THE WAVE ── */
export function RideTheWave() {
  const y = useScrollY();
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section ref={sceneRef} className="rd-section rd-section-wave rd-scene">
      <div
        className="rd-wave-bg"
        style={{ transform: `translateY(${y * -0.08}px) scale(1.08)` }}
      />
      <div className="rd-wave-overlay" />
      <div className="rd-wave-content">
        <div className="rd-container">
          <Reveal stagger>
            <h2 className="rd-h-display">
              Ride the
              <br />
              <em className="rd-em-grad">agentic wave.</em>
            </h2>
            <div className="rd-wave-row">
              <p className="rd-wave-copy">
                Teams shipping with Mixar move{" "}
                <span className="rd-wave-stat">4.3×</span> faster on UV +
                texturing, and ship{" "}
                <span className="rd-wave-stat">2.1× more</span> hero assets per
                sprint. Internal benchmark, v3 suite.
              </p>
              <div className="rd-btn-row">
                <Btn primary>Read the benchmark →</Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 8. TRY MIXAR ── */
export function TryMixar() {
  const sceneRef = useScrollScene<HTMLElement>();
  return (
    <section
      ref={sceneRef}
      id="cta"
      className="rd-section rd-section-cta rd-scene"
    >
      <div className="rd-cta-bg" />
      <div className="rd-container rd-cta-container">
        <Reveal stagger>
          <h2 className="rd-h-display rd-h-center">
            Direct the work.
            <br />
            <em className="rd-em-grad">Skip the drudgery.</em>
          </h2>
          <div className="rd-btn-row rd-btn-row-center">
            <Btn primary href="/downloads">Download Mixar →</Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* prevent unused-symbol warnings for tokens we may want to use later */
void ink;
void dim;
void rule;
void surface;
void accent;
void grad;
void mono;
