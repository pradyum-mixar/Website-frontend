import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { PublicNavbar } from "../components/PublicNavbar";
import { SmoothScroll } from "../components/SmoothScroll";
import {
  Walkthrough,
  Scrolly,
  System,
  MeetMixie,
  BlenderBetter,
  UseCases,
  RideTheWave,
  TryMixar,
} from "./landing/RedesignSections";
import "../assets/css/redesign-fonts.css";
import "../assets/css/landing.css";
import "../assets/css/redesign.css";

// Critical above-fold images — must be loaded before we reveal the hero section.
const CRITICAL_CDN_IMAGES = [
  "https://d2znch1yzypu23.cloudfront.net/Logo-Primary_light.png",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Viewport.svg",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Header.svg",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Moodboard.svg",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Chat%20Window.svg",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Chat_Prompt%20Window.svg",
  "https://d2znch1yzypu23.cloudfront.net/Mixar-UI-Chat%20Message.svg",
];

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // never reject — a broken image shouldn't block render
    img.src = url;
  });
}

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // The global body styles (display:flex, overflow-x:hidden) break position:sticky
  // for the scrolly section. Restore plain block flow + warm-dark background to
  // match the new section palette while this page is mounted.
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prev = {
      display: body.style.display,
      flexDir: body.style.flexDirection,
      overflowX: body.style.overflowX,
      background: body.style.background,
      htmlOverflowX: html.style.overflowX,
      htmlBg: html.style.background,
    };
    body.style.display = "block";
    body.style.flexDirection = "";
    body.style.overflowX = "clip";
    body.style.background = "#0e0c09";
    html.style.overflowX = "clip";
    html.style.background = "#0e0c09";
    html.style.setProperty("--bg", "#0e0c09");
    return () => {
      body.style.display = prev.display;
      body.style.flexDirection = prev.flexDir;
      body.style.overflowX = prev.overflowX;
      body.style.background = prev.background;
      html.style.overflowX = prev.htmlOverflowX;
      html.style.background = prev.htmlBg;
      html.style.removeProperty("--bg");
    };
  }, []);

  // Wait for critical above-fold images + custom fonts, then reveal.
  // 5-second hard fallback so slow connections are never permanently blocked.
  useEffect(() => {
    let cancelled = false;

    const fallback = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 5000);

    Promise.all([
      ...CRITICAL_CDN_IMAGES.map(preloadImage),
      document.fonts.ready,
    ]).then(() => {
      if (!cancelled) {
        clearTimeout(fallback);
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);


  return (
    <>
{/* Loading overlay — hides the page until CDN images + fonts are ready */}
      <div
        className={`lp-overlay${isReady ? " lp-overlay--hidden" : ""}`}
        aria-hidden="true"
      >
        <img src="/assets/Logomark.svg" alt="" className="lp-overlay-logo" />
      </div>

      <PublicNavbar />

      <div className="hero-wrapper">
        <header>
          <p className="intro-text">Introducing Mixar</p>
          <h1>The Agentic 3D-Editor</h1>
          <p className="sub-headline">
            Power of Blender. Speed of AI.
            The End of <span className="highlight">Grunt Work</span>
          </p>
          <div className="actions">
            <Link to={isAuthenticated ? "/app" : "/auth/signup"} className="btn-download" onClick={() => window.gtag?.("event", "cta_click", { location: "hero", label: isAuthenticated ? "dashboard" : "sign_up" })}>
              {isAuthenticated ? "Dashboard" : "Sign Up"}
            </Link>
            <Link to={isAuthenticated ? "/app" : "/auth/signup"} className="btn-arrow" onClick={() => window.gtag?.("event", "cta_click", { location: "hero", label: "arrow" })}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </header>
        <main className="lp-main">
          <div className="stack">
            <div className="stack-base">
              <div className="stack-layer viewport-area">
                <img
                  src="/assets/ui-stack/viewport-1.svg"
                  alt="Viewport"
                  className="stack-item"
                />
              </div>
              <div className="stack-layer viewport-buttons">
                <img
                  src="/assets/ui-stack/viewport-2.svg"
                  alt="Viewport buttons"
                  className="stack-item"
                />
              </div>
              <div className="stack-layer mood-board-area">
                <img
                  src="/assets/ui-stack/moodboard-1.svg"
                  alt="Mood board"
                  className="stack-item"
                />
              </div>
              <div className="stack-layer mood-board-buttons">
                <img
                  src="/assets/ui-stack/moodboard-2.svg"
                  alt="Mood board buttons"
                  className="stack-item"
                />
              </div>
              <div className="stack-layer chat-bubble">
                <img
                  src="/assets/ui-stack/FloatingChatBubble.svg"
                  alt="Floating chat bubble"
                  className="stack-item"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <SmoothScroll />

      <Walkthrough />
      <Scrolly />
      <System />
      <MeetMixie />
      <BlenderBetter />
      <UseCases />
      <RideTheWave />
      <TryMixar />

      <footer className="site-footer">
        <div className="footer-bg-wrapper">
          <div className="footer-bg-1">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 1015 1014.97"
              style={{ width: "100%", height: "100%" }}
            >
              <g id="Group" opacity="0.1">
                <path
                  d="M74.7187 529.124C75.5794 523.637 79.4523 518.689 86.2298 514.385C93.0073 510.082 99.4621 508.361 105.487 509.329L113.77 510.62C117.751 511.266 121.193 512.341 123.99 513.74C127.54 516.86 130.015 519.872 131.413 522.561C132.812 525.358 134.426 529.984 136.47 536.439L172.724 658.865L263.844 673.281C248.675 621.212 233.399 569.143 217.908 517.075L215.003 506.64C214.788 505.456 214.25 504.058 213.927 502.767C202.954 495.236 191.658 487.383 179.394 478.992C156.695 463.392 131.198 445.857 103.227 426.493C93.0073 426.493 82.8948 427.999 72.9974 430.688C59.3348 434.453 46.8556 440.263 35.6672 448.224C24.3714 456.185 15.0119 465.652 7.37375 476.732C4.68426 480.605 2.42506 484.693 0.381044 488.889C-1.55539 538.698 3.93119 587.432 15.8726 634.014L57.0756 640.576L74.7187 529.016V529.124Z"
                  fill="url(#paint0_linear_1_99)"
                  id="Vector"
                />
                <path
                  d="M658.882 842.51L640.593 958.266L716.652 970.315C718.696 969.347 720.848 968.486 722.892 967.518L746.775 816.476L658.882 842.51Z"
                  fill="url(#paint1_linear_1_99)"
                  id="Vector_2"
                />
                <path
                  d="M388.313 964.381C393.907 958.141 399.071 951.687 403.59 945.339C411.551 933.828 419.081 922.855 426.504 912.097C426.504 908.332 426.504 904.459 426.934 900.694L428.118 888.537C430.377 874.014 434.68 861.427 441.027 850.669C443.932 844.967 448.128 839.373 453.292 833.779C458.563 828.185 464.372 823.129 470.72 818.503C477.067 813.877 483.522 809.896 489.869 806.561C494.71 804.087 498.905 802.473 502.778 801.398C514.612 784.185 525.585 768.263 535.375 754.17C551.297 731.148 564.637 711.568 575.395 695.647C586.153 679.725 595.082 666.385 602.505 655.734L630.476 614.854C634.026 608.722 639.082 604.204 645.752 601.084C652.422 598.072 658.231 596.888 663.18 597.641L669.957 598.717C674.906 599.47 680.393 602.59 686.202 607.861C692.011 613.133 694.378 619.48 693.195 627.011L673.508 751.373C685.341 747.93 697.175 744.38 709.009 740.938C726.437 735.881 743.865 730.61 761.293 725.554L775.601 635.509C776.892 623.891 775.386 611.627 771.082 598.717C770.114 595.705 768.931 592.693 767.64 589.788L657.371 513.944C654.143 513.944 651.023 513.944 647.688 514.267C638.544 515.127 630.26 516.741 622.73 519.108C609.713 523.734 597.879 530.942 587.444 540.731C576.901 550.629 568.294 560.419 561.624 570.101L501.702 657.348C501.702 663.05 501.487 668.644 500.627 674.131L498.045 685.211C496.001 698.228 490.837 710.385 482.661 722.004C474.485 733.515 464.695 743.412 453.292 751.911C444.578 758.366 435.433 763.637 425.751 767.725L331.941 904.136L330.866 900.909C316.988 854.434 303.433 807.96 289.77 761.485L198.865 747.07L250.719 921.995C254.484 934.043 258.68 944.156 263.198 952.87C290.738 967.931 319.893 980.626 350.553 990.63C357.438 988.264 364 985.036 370.132 980.841C376.695 976.215 382.827 970.836 388.421 964.596L388.313 964.381Z"
                  fill="url(#paint2_linear_1_99)"
                  id="Vector_3"
                />
                <path
                  d="M842.411 356.468L958.167 374.756L970.216 298.697C969.248 296.653 968.387 294.502 967.419 292.458L816.377 268.575L842.411 356.468Z"
                  fill="url(#paint3_linear_1_99)"
                  id="Vector_4"
                />
                <path
                  d="M964.293 626.893C958.053 621.299 951.598 616.135 945.251 611.617C933.74 603.656 922.767 596.125 912.009 588.702C908.243 588.702 904.371 588.702 900.605 588.272L888.449 587.089C873.925 584.83 861.339 580.526 850.581 574.179C844.879 571.274 839.285 567.079 833.691 561.915C828.096 556.644 823.04 550.834 818.414 544.487C813.788 538.14 809.808 531.685 806.473 525.338C803.999 520.497 802.385 516.301 801.309 512.428C784.096 500.595 768.174 489.621 754.082 479.832C731.059 463.91 711.48 450.57 695.558 439.812C679.636 429.054 666.296 420.017 655.646 412.702L614.766 384.731C608.634 381.181 604.115 376.125 600.995 369.455C597.983 362.785 596.8 356.975 597.553 352.027L598.629 345.249C599.382 340.301 602.502 334.814 607.773 329.005C613.044 323.195 619.392 320.829 626.922 322.012L751.284 341.699C747.842 329.865 744.292 318.031 740.849 306.198C735.793 288.77 730.522 271.342 725.465 253.914L635.421 239.606C623.802 238.315 611.538 239.821 598.629 244.124C595.616 245.092 592.604 246.276 589.7 247.567L513.856 357.836C513.856 361.063 513.856 364.183 514.178 367.518C515.039 376.663 516.653 384.946 519.02 392.477C523.645 405.494 530.853 417.328 540.643 427.763C550.54 438.306 560.33 446.912 570.012 453.582L657.26 513.504L767.529 589.348L903.94 683.158L900.713 684.233C854.238 698.111 807.764 711.666 761.289 725.329C743.861 730.385 726.433 735.656 709.006 740.713C697.172 744.155 685.338 747.705 673.504 751.148C621.436 766.317 569.367 781.593 517.298 797.085L506.863 799.989C505.68 800.204 504.281 800.742 502.99 801.065C499.117 802.141 494.922 803.647 490.081 806.229C483.626 809.564 477.279 813.544 470.931 818.17C464.584 822.796 458.775 827.96 453.503 833.447C448.232 839.041 444.144 844.635 441.239 850.337C434.892 861.095 430.589 873.789 428.33 888.205L427.146 900.361C426.824 904.234 426.716 907.999 426.716 911.765C426.716 921.985 428.222 932.097 430.912 941.995C434.677 955.657 440.486 968.137 448.447 979.325C456.408 990.621 465.875 999.98 476.956 1007.62C480.829 1010.31 484.917 1012.57 489.112 1014.61C569.367 1017.62 646.932 1001.59 716.751 969.965L640.692 957.917L529.132 940.273C523.646 939.413 518.697 935.54 514.394 928.762C510.09 921.985 508.369 915.53 509.337 909.506L510.628 901.222C511.274 897.242 512.35 893.799 513.748 891.002C516.868 887.452 519.88 884.977 522.57 883.579C525.367 882.18 529.993 880.567 536.448 878.523L658.873 842.268L746.766 816.234L921.691 764.38C933.74 760.615 943.852 756.419 952.566 751.901C967.628 724.361 980.322 695.206 990.327 664.546C987.96 657.661 984.733 651.099 980.537 644.967C975.911 638.404 970.532 632.272 964.293 626.678V626.893Z"
                  fill="url(#paint4_linear_1_99)"
                  id="Vector_5"
                />
                <path
                  d="M626.816 51.0352C621.221 57.2749 616.058 63.7296 611.539 70.0769C603.578 81.5879 596.048 92.561 588.625 103.319C588.625 107.084 588.625 110.957 588.194 114.723L587.011 126.879C584.752 141.402 580.449 153.989 574.101 164.747C571.197 170.449 567.001 176.043 561.837 181.637C556.566 187.231 550.757 192.288 544.409 196.914C538.062 201.539 531.607 205.52 525.26 208.855C520.419 211.329 516.223 212.943 512.351 214.019C500.517 231.231 489.544 247.153 479.754 261.246C463.832 284.268 450.492 303.848 439.734 319.77C428.976 335.692 420.047 349.031 412.624 359.682L384.653 400.562C381.103 406.694 376.047 411.213 369.377 414.332C362.707 417.345 356.898 418.528 351.949 417.775L345.171 416.699C340.223 415.946 334.736 412.826 328.927 407.555C323.118 402.283 320.751 395.936 321.934 388.406L341.621 264.043C329.788 267.486 317.954 271.036 306.12 274.479C288.692 279.535 271.264 284.806 253.836 289.863L239.528 379.907C238.237 391.525 239.743 403.79 244.046 416.699C245.015 419.711 246.198 422.724 247.489 425.628L357.758 501.472C360.986 501.472 364.106 501.472 367.441 501.149C376.585 500.289 384.868 498.675 392.399 496.308C405.416 491.682 417.25 484.474 427.685 474.685C438.228 464.787 446.834 454.998 453.504 445.315L513.426 358.068L589.27 247.799L683.08 111.388L684.156 114.615C698.033 161.089 711.588 207.564 725.251 254.038C730.307 271.466 735.579 288.894 740.635 306.322C744.078 318.156 747.628 329.99 751.07 341.824C766.239 393.892 781.515 445.961 797.007 498.03L800.019 508.465C800.234 509.648 800.772 511.047 801.095 512.338C802.171 516.211 803.677 520.406 806.259 525.247C809.594 531.702 813.574 538.049 818.2 544.396C822.826 550.744 827.99 556.553 833.477 561.824C839.071 567.096 844.665 571.184 850.367 574.088C861.125 580.436 873.819 584.739 888.235 586.998L900.391 588.181C904.264 588.504 908.029 588.612 911.795 588.612C922.015 588.612 932.127 587.106 942.025 584.416C955.687 580.651 968.166 574.842 979.355 566.881C990.651 558.92 1000.01 549.453 1007.65 538.372C1010.34 534.499 1012.6 530.411 1014.64 526.215C1017.65 445.961 1001.62 368.396 969.995 298.576L957.946 374.635L940.303 486.196C939.443 491.682 935.57 496.631 928.792 500.934C922.015 505.237 915.56 506.959 909.535 505.99L901.252 504.699C897.271 504.054 893.829 502.978 891.032 501.58C887.482 498.46 885.007 495.448 883.609 492.758C882.21 489.961 880.596 485.335 878.552 478.88L842.298 356.454L816.264 268.562L764.41 93.6368C760.645 81.5879 756.449 71.4754 751.931 62.7614C724.391 47.7002 695.236 35.0058 664.576 25.0009C657.691 27.3677 651.129 30.595 644.997 34.7907C638.434 39.4166 632.302 44.7956 626.708 51.0352H626.816Z"
                  fill="url(#paint5_linear_1_99)"
                  id="Vector_6"
                />
                <path
                  d="M356.253 172.94L374.542 57.184L298.483 45.1351C296.439 46.1033 294.287 46.9639 292.243 47.9321L268.361 198.974L356.253 172.94Z"
                  fill="url(#paint6_linear_1_99)"
                  id="Vector_7"
                />
                <path
                  d="M289.771 761.272L379.815 775.58C391.434 776.871 403.698 775.365 416.608 771.062C419.62 770.093 422.632 768.91 425.537 767.619C435.219 763.531 444.363 758.26 453.077 751.805C464.373 743.306 474.163 733.408 482.446 721.897C490.622 710.386 495.786 698.122 497.83 685.105L500.412 674.024C501.273 668.538 501.488 662.944 501.488 657.242C501.488 654.015 501.488 650.895 501.165 647.56C500.305 638.416 498.691 630.132 496.324 622.601C491.698 609.584 484.49 597.75 474.701 587.315C464.803 576.772 455.014 568.166 445.331 561.496L358.084 501.574L247.815 425.73L111.403 331.92L114.631 330.845C161.105 316.967 207.58 303.412 254.054 289.749C271.482 284.693 288.91 279.421 306.338 274.365C318.172 270.923 330.006 267.373 341.84 263.93C393.908 248.761 445.977 233.485 498.046 217.993L508.481 214.981C509.664 214.766 511.063 214.228 512.354 213.905C516.226 212.83 520.422 211.323 525.263 208.742C531.718 205.407 538.065 201.426 544.412 196.8C550.76 192.174 556.569 187.01 561.84 181.524C567.112 175.93 571.2 170.336 574.105 164.634C580.452 153.876 584.755 141.181 587.014 126.766L588.197 114.609C588.52 110.736 588.628 106.971 588.628 103.206C588.628 92.9856 587.122 82.8731 584.432 72.9757C580.667 59.3131 574.858 46.8338 566.897 35.6455C558.936 24.3496 549.469 14.9902 538.388 7.35203C534.515 4.66253 530.427 2.40335 526.231 0.359336C445.977 -2.6529 368.412 13.3765 298.592 45.005L374.651 57.0539L486.212 74.697C491.698 75.5577 496.647 79.4305 500.95 86.2081C505.253 92.9856 506.975 99.4404 506.006 105.465L504.715 113.749C504.07 117.729 502.994 121.172 501.596 123.969C498.476 127.519 495.464 129.993 492.774 131.392C489.977 132.79 485.351 134.404 478.896 136.448L356.47 172.702L268.578 198.737L93.6528 250.59C81.6038 254.355 71.4914 258.551 62.7774 263.069C47.7162 290.61 35.0218 319.764 25.0168 350.424C27.3836 357.309 30.611 363.872 34.8066 370.004C39.4325 376.566 44.8115 382.698 51.0512 388.292C57.2908 393.887 63.7456 399.05 70.0928 403.569C81.6039 411.53 92.577 419.06 103.335 426.483C131.413 445.74 156.802 463.275 179.502 478.982C191.658 487.373 203.062 495.227 214.035 502.757C231.247 514.591 247.169 525.564 261.262 535.354C284.284 551.276 303.864 564.616 319.786 575.374C335.707 586.132 349.047 595.061 359.698 602.484L400.578 630.455C406.71 634.005 411.229 639.061 414.348 645.731C417.361 652.401 418.544 658.21 417.791 663.159L416.715 669.936C415.962 674.885 412.842 680.372 407.571 686.181C402.299 691.99 395.952 694.357 388.422 693.174L264.059 673.487L172.939 659.071L57.1832 640.782L15.9801 634.22C23.941 664.88 34.5914 694.68 47.8238 722.973L198.866 746.856L289.771 761.272Z"
                  fill="url(#paint7_linear_1_99)"
                  id="Vector_8"
                />
              </g>
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear_1_99"
                  x1="-0.0492747"
                  x2="263.952"
                  y1="550.102"
                  y2="550.102"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint1_linear_1_99"
                  x1="640.593"
                  x2="746.775"
                  y1="893.396"
                  y2="893.396"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint2_linear_1_99"
                  x1="198.865"
                  x2="775.816"
                  y1="752.126"
                  y2="752.126"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint3_linear_1_99"
                  x1="816.377"
                  x2="970.108"
                  y1="321.719"
                  y2="321.719"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint4_linear_1_99"
                  x1="426.501"
                  x2="990.327"
                  y1="627.324"
                  y2="627.324"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint5_linear_1_99"
                  x1="239.313"
                  x2="1015.18"
                  y1="306.86"
                  y2="306.86"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint6_linear_1_99"
                  x1="268.468"
                  x2="374.65"
                  y1="122.055"
                  y2="122.055"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint7_linear_1_99"
                  x1="15.8726"
                  x2="588.628"
                  y1="388.077"
                  y2="388.077"
                >
                  <stop stopColor="#85C449" />
                  <stop offset="0.22" stopColor="#6CC35F" />
                  <stop offset="0.67" stopColor="#2FC199" />
                  <stop offset="1" stopColor="#00C0C7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="footer-logomark">
            <img
              loading="eager"
              src="https://d2znch1yzypu23.cloudfront.net/Logomark.svg"
              alt="Mixar"
            />
          </div>
          <div className="footer-bg-2">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 840.981 225.786"
              style={{ width: "100%", height: "auto" }}
            >
              <g id="Group">
                <path
                  d="M8.9528e-06 53.0479H31.3276L33.2262 69.9577C44.0841 55.5992 60.4005 47.886 80.5142 47.886C102.23 47.886 117.894 57.1419 126.2 73.755C136.761 56.8452 154.621 47.886 176.692 47.886C211.52 47.886 230.685 69.9577 230.685 109.533V225.528H195.204V109.533C195.204 89.4188 186.245 80.1628 166.428 80.1628C143.407 80.1628 133.202 92.6227 133.202 121.399V225.528H97.424V109.533C97.424 89.4188 89.4141 80.1628 69.6564 80.1628C46.6354 80.1628 35.7775 92.6227 35.7775 121.399V225.528H8.9528e-06V52.9886V53.0479Z"
                  fill="white"
                  id="Vector"
                />
                <path
                  d="M273.822 0H309.6V32.2769H273.822V0ZM273.822 53.0433H309.6V225.582H273.822V53.0433Z"
                  fill="white"
                  id="Vector_2"
                />
                <path
                  d="M394.916 136.114L339.974 53.0488H382.159L416.038 110.245L449.917 53.0488H492.102L437.16 136.114L495.306 225.588H453.121L416.038 162.339L378.955 225.588H336.77L394.916 136.114Z"
                  fill="white"
                  id="Vector_3"
                />
                <path
                  d="M509.605 174.998C509.605 139.873 533.575 122.31 577.362 122.31H619.845V108.901C619.845 85.8801 608.037 75.0223 584.067 75.0223C562.648 75.0223 552.146 83.9815 549.536 101.544L516.962 94.8394C520.819 63.8678 544.136 45 583.118 45C629.1 45 655.622 68.3177 655.622 106.646V178.854C655.622 186.864 659.775 190.661 669.387 190.661V225.786C647.968 225.786 632.66 215.878 625.6 204.367C612.487 220.031 595.578 225.786 572.26 225.786C533.575 225.786 509.664 208.876 509.664 174.998H509.605ZM619.845 167.64V149.129L577.362 149.425C554.697 149.425 544.433 156.782 544.433 173.099C544.433 189.415 554.045 195.467 577.362 195.467C606.139 195.467 619.845 185.855 619.845 167.64Z"
                  fill="white"
                  id="Vector_4"
                />
                <path
                  d="M700.067 53.0332H731.394L734.242 76.3509C746.049 58.1358 763.612 47.9306 785.387 47.9306C815.112 47.9306 833.327 66.1457 840.981 100.025L805.857 107.382C802.653 89.1667 794.999 79.5549 778.386 79.5549C752.813 79.5549 735.903 103.822 735.903 138.353V225.572H700.126V53.0332H700.067Z"
                  fill="white"
                  id="Vector_5"
                />
              </g>
            </svg>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-links">
              <div className="footer-links-column">
                <a href="/about" className="footer-link">
                  About
                </a>
                <a href="#features" className="footer-link">
                  Features
                </a>
                <Link to="/docs" className="footer-link">
                  Docs
                </Link>
              </div>
              <div className="footer-links-column">
                <Link to="/pricing" className="footer-link">
                  Pricing
                </Link>
                <Link to="/downloads" className="footer-link">
                  Download
                </Link>
                <Link to="/changelog" className="footer-link">
                  Changelog
                </Link>
              </div>
            </div>

            <div className="footer-cta">
              <h3>Still have questions?</h3>
              <Link to="/contact" className="btn-mixie-combined">
                <span className="btn-mixie-text">Get in touch</span>
                <span className="btn-mixie-arrow">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="#010000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <p className="copyright">mixar. All rights reserved.</p>

            <div className="social-icons">
              <a
                href="https://www.instagram.com/mixie3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
              >
                <svg viewBox="0 0 24.35 24.35" fill="none">
                  <path
                    d="M12.18 0C15.65 0 18.71 1.4 21.35 4.18C23.35 6.6 24.35 9.25 24.35 12.13C24.35 15.81 22.86 18.97 19.87 21.6C17.48 23.43 14.93 24.35 12.22 24.35C8.44 24.35 5.22 22.77 2.54 19.62C0.85 17.27 0 14.79 0 12.18C0 9.57 0.89 7.02 2.66 4.61C4.24 2.59 6.44 1.18 9.27 0.38C9.76 0.21 10.73 0.08 12.19 0H12.18ZM4.79 11.83V12.46C4.79 15.47 5 17.13 5.42 17.45C5.72 18.18 6.39 18.77 7.45 19.22C8.05 19.45 9.18 19.56 10.83 19.56H13.66C15.87 19.56 17.24 19.29 17.76 18.76C18.43 18.43 18.95 17.71 19.32 16.6C19.49 16.02 19.57 15.03 19.57 13.64V10.81C19.57 8.42 19.26 6.96 18.64 6.41C18.29 5.8 17.56 5.32 16.44 4.97C15.86 4.83 14.53 4.76 12.47 4.76H11.84C8.9 4.76 7.25 4.97 6.89 5.39C6.19 5.71 5.61 6.35 5.16 7.33C4.91 7.84 4.78 9.34 4.78 11.81L4.79 11.83ZM12.6 6.13C15.28 6.13 16.62 6.26 16.62 6.51C16.92 6.51 17.33 6.88 17.85 7.61C18.1 7.89 18.23 9.03 18.23 11.03V13.31C18.23 15.4 18.09 16.56 17.81 16.78C17.58 17.24 17.17 17.63 16.58 17.92C16.31 18.12 15.22 18.22 13.33 18.22H11.05C8.88 18.22 7.71 18.06 7.54 17.75C7.08 17.56 6.69 17.08 6.36 16.31C6.24 16.31 6.17 15.07 6.15 12.59V11.75C6.15 9.07 6.28 7.73 6.53 7.73C6.71 7.22 7.11 6.81 7.71 6.5C8.05 6.25 9.02 6.12 10.63 6.12H12.62L12.6 6.13ZM8.38 12.17C8.38 13.52 9.01 14.62 10.28 15.47C10.92 15.81 11.55 15.98 12.18 15.98C13.8 15.98 14.98 15.16 15.73 13.53C15.9 13.04 15.98 12.61 15.98 12.22C15.98 10.61 15.19 9.43 13.61 8.67C13.28 8.53 12.81 8.43 12.22 8.37C10.64 8.37 9.46 9.16 8.67 10.74C8.53 11.11 8.43 11.59 8.37 12.18L8.38 12.17ZM12.18 9.72C13.18 9.72 13.94 10.24 14.46 11.28C14.57 11.62 14.63 11.94 14.63 12.21C14.63 13.25 14.07 14.01 12.94 14.49C12.66 14.57 12.39 14.62 12.14 14.62C11.04 14.62 10.27 14 9.82 12.76L9.74 12.17C9.74 11.08 10.35 10.29 11.56 9.8L12.19 9.72H12.18ZM15.22 8.24C15.22 8.74 15.53 9.04 16.15 9.13C16.71 9.01 16.99 8.73 16.99 8.28C16.9 7.66 16.6 7.35 16.1 7.35C15.51 7.49 15.21 7.79 15.21 8.24H15.22Z"
                    fill="#C7C7C7"
                  />
                </svg>
              </a>

              <a
                href="https://x.com/mixie3D"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper bg-gray"
              >
                <svg viewBox="0 0 14 14" fill="none" stroke="#006265">
                  <path
                    d="M10.1792 12.7837L1.56029 1.7022C1.35805 1.44227 1.54334 1.06345 1.87266 1.06345H3.50837C3.63048 1.06345 3.74577 1.11984 3.82074 1.21625L12.4397 12.2977C12.6419 12.5578 12.4567 12.9365 12.1273 12.9365H10.4917C10.3695 12.9365 10.2542 12.8802 10.1792 12.7837Z"
                    fill="white"
                  />
                  <path
                    d="M12.2769 1.06345L1.72309 12.9365"
                    stroke="#006265"
                    strokeLinecap="round"
                  />
                </svg>
              </a>

              <a
                href="https://discord.gg/YVqvkQx8rX"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper bg-gray"
              >
                <svg viewBox="0 0 18 18" fill="none">
                  <path
                    d="M5.25 9.5625C5.25 9.9106 5.36853 10.2444 5.5795 10.4906C5.79048 10.7367 6.07663 10.875 6.375 10.875C6.67337 10.875 6.95952 10.7367 7.1705 10.4906C7.38147 10.2444 7.5 9.9106 7.5 9.5625C7.5 9.2144 7.38147 8.88056 7.1705 8.63442C6.95952 8.38828 6.67337 8.25 6.375 8.25C6.07663 8.25 5.79048 8.38828 5.5795 8.63442C5.36853 8.88056 5.25 9.2144 5.25 9.5625Z"
                    stroke="#006265"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5 9.5625C10.5 9.9106 10.6185 10.2444 10.8295 10.4906C11.0405 10.7367 11.3266 10.875 11.625 10.875C11.9234 10.875 12.2095 10.7367 12.4205 10.4906C12.6315 10.2444 12.75 9.9106 12.75 9.5625C12.75 9.2144 12.6315 8.88056 12.4205 8.63442C12.2095 8.38828 11.9234 8.25 11.625 8.25C11.3266 8.25 11.0405 8.38828 10.8295 8.63442C10.6185 8.88056 10.5 9.2144 10.5 9.5625Z"
                    stroke="#006265"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.125 4.125C7.125 4.125 7.935 3.75 9 3.75C10.065 3.75 10.875 4.125 10.875 4.125L11.25 3C12.5662 3 13.545 3.21975 14.625 3.75C15.375 5.00025 16.875 8.55 16.875 12.75C15.477 14.193 14.397 14.802 12.75 15L11.625 13.125C11.25 13.2502 10.2 13.5 9 13.5C7.8 13.5 6.75 13.2502 6.375 13.125L5.25 15C3.603 14.802 2.523 14.193 1.125 12.75C1.125 8.55 2.625 5.00025 3.375 3.75C4.455 3.21975 5.43375 3 6.75 3L7.125 4.125Z"
                    stroke="#006265"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.375 13.125C5.5605 12.9172 4.875 12.375 4.875 12.375"
                    stroke="#006265"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.625 13.125C12.4395 12.9172 13.125 12.375 13.125 12.375"
                    stroke="#006265"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/mixar3d"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-wrapper"
              >
                <svg viewBox="0 0 24.35 24.35" fill="none">
                  <path
                    d="M12.18 0C15.65 0 18.71 1.4 21.35 4.18C23.35 6.6 24.35 9.25 24.35 12.13C24.35 15.81 22.86 18.97 19.87 21.6C17.48 23.43 14.93 24.35 12.22 24.35C8.44 24.35 5.22 22.77 2.54 19.62C0.850001 17.27 0 14.79 0 12.18C0 9.57 0.890004 7.02 2.66 4.61C4.23 2.59 6.43 1.18 9.25 0.38C9.74 0.21 10.71 0.08 12.17 0L12.18 0ZM4.78 6.55C4.97 7.73 5.55 8.32 6.51 8.32H6.64C7.51 8.32 8.08 7.8 8.33 6.76V6.51C8.33 5.74 7.89 5.19 7.02 4.86L6.6 4.78C5.73 4.78 5.14 5.27 4.83 6.26L4.79 6.56L4.78 6.55ZM5.04 9.68V19.57H8.08V9.68H5.04ZM12.98 10.99H12.94V9.68H10.02V19.57H13.06V14.71C13.06 12.99 13.68 12.13 14.92 12.13C15.64 12.13 16.13 12.5 16.4 13.23C16.48 13.72 16.53 14.28 16.53 14.92V19.57H19.57V14.54C19.57 12.13 19.12 10.67 18.22 10.14C17.67 9.69 16.91 9.46 15.94 9.46C14.72 9.46 13.73 9.97 12.98 10.98V10.99Z"
                    fill="#C7C7C7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
