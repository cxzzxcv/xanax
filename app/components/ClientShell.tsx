"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import TrailingCursor from "./TrailingCursor";
import styles from "./ClientShell.module.css";
import { introOptions, playerOptions } from "./options";
import { songs, normalizeSrc } from "./songs.config";
import { getSharedAudio } from "./audioBus";

type Phase = "intro" | "hero";
type IntroStage = "booting" | "transitioned";

const POST_BOOT_HOLD_MS = 350;   // pause after the last boot line prints
const TRANSITION_DURATION_MS = 1100; // boot fade-out / nier_bg crossfade
const INTRO_FADE_OUT_MS = 900;   // fade of the whole intro into the hero

const INTRO_COOKIE = "viewedIntro";
/** Tab-scoped storage key. sessionStorage is wiped when the tab/browser
 *  closes, so we use it instead of a session cookie — Chrome's "Continue
 *  where you left off" preserves session cookies across browser restarts,
 *  which would defeat the point. sessionStorage isn't affected by that. */
const HERO_SESSION_KEY = "heroSession";

// YoRHa-style boot lines printed progressively in the top-left.
const BOOT_LINES: { text: string; delay: number }[] = [
  { text: "BOOTING SYSTEM...",            delay: 80 },
  { text: "",                                       delay: 220 },
  { text: "Commencing System Check",                delay: 200 },
  { text: "Memory Unit: Green",                     delay: 140 },
  { text: "Initializing Tactics Log",               delay: 150 },
  { text: "Loading Geographic Data",                delay: 180 },
  { text: "Vitals: Green",                          delay: 130 },
  { text: "Remaining MP: 100%",                     delay: 150 },
  { text: "Black Box Temperature: Normal",          delay: 180 },
  { text: "Black Box internal Pressure: Normal",    delay: 180 },
  { text: "Activating IFF",                         delay: 130 },
  { text: "Activating FCS",                         delay: 130 },
  { text: "Initializing Pod Connection",            delay: 160 },
  { text: "Launching DBU Setup",                    delay: 150 },
  { text: "Activating Inertia Control System",      delay: 180 },
  { text: "Activating Environmental Sensors",       delay: 180 },
  { text: "Equipment Authentication: Complete",     delay: 200 },
  { text: "Equipment Status: Green",                delay: 150 },
  { text: "All Systems Green",                      delay: 130 },
  { text: "Combat Preparations Complete",           delay: 200 },
];

function setViewedIntroCookie(): void {
  if (typeof document === "undefined") return;
  // 1 year
  document.cookie = `${INTRO_COOKIE}=1; max-age=31536000; path=/; samesite=lax`;
}

/** Mark this tab as "in hero session". Cleared automatically when the tab
 *  / browser closes (sessionStorage semantics). */
function setHeroSessionFlag(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HERO_SESSION_KEY, "1");
  } catch {
    /* Storage might be disabled (private mode, etc.) — silently ignore. */
  }
}

function readHeroSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(HERO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Decide whether to skip the boot sequence on this visit.
 *  `hasViewedIntro` is supplied by the server (page.tsx) so SSR + client
 *  hydration agree on the initial value. */
function decideSkipIntro(hasViewedIntro: boolean): boolean {
  if (!introOptions.includeIntro) return true;
  if (introOptions.rememberIntroSeen && hasViewedIntro) return true;
  return false;
}

interface ClientShellProps {
  /** Server-read value of the viewedIntro cookie. */
  hasViewedIntro: boolean;
}

export default function ClientShell({ hasViewedIntro }: ClientShellProps) {
  const [skipIntro] = useState<boolean>(() => decideSkipIntro(hasViewedIntro));

  const [phase, setPhase] = useState<Phase>("intro");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [introStage, setIntroStage] = useState<IntroStage>(
    skipIntro ? "transitioned" : "booting"
  );
  const [introMounted, setIntroMounted] = useState(true);
  const [introFadingOut, setIntroFadingOut] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  /** While true, the intro DOM is hidden so we don't flash the boot/sig
   *  before the sessionStorage check resolves. */
  const [bootGate, setBootGate] = useState<boolean>(true);

  // ---- Resume hero on reload (sessionStorage flag set on continue) ----
  // Runs once on mount. If the flag is present, fade the hero in smoothly
  // instead of replaying the boot + click-to-continue.
  useEffect(() => {
    if (!introOptions.rememberHeroSession) {
      setBootGate(false);
      return;
    }
    if (readHeroSessionFlag()) {
      // Skip the intro entirely, animate the hero in
      setPhase("hero");
      setIntroMounted(false);
      // Give Hero one frame at visible=false so its CSS transition kicks in
      setBootGate(false);
      window.requestAnimationFrame(() => setHeroVisible(true));
    } else {
      setBootGate(false);
    }
  }, []);

  // ---- Boot sequence: print lines, then transition to nier_bg ----
  useEffect(() => {
    if (phase !== "intro" || skipIntro) return;
    let cancelled = false;
    const timeouts: number[] = [];
    let cumulative = 0;

    BOOT_LINES.forEach((line) => {
      cumulative += line.delay;
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setBootLines((prev) => [...prev, line.text]);
      }, cumulative);
      timeouts.push(t);
    });

    // Hold so user can read the last line, then transition out
    cumulative += POST_BOOT_HOLD_MS;
    timeouts.push(
      window.setTimeout(() => {
        if (cancelled) return;
        setIntroStage("transitioned");
      }, cumulative)
    );

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [phase, skipIntro]);

  // ---- Persist that the user has seen the intro (when allowed) ----
  useEffect(() => {
    if (
      introStage === "transitioned" &&
      !skipIntro &&
      introOptions.rememberIntroSeen
    ) {
      setViewedIntroCookie();
    }
  }, [introStage, skipIntro]);

  const continueReady = introStage === "transitioned";

  // ---- Continue → fade intro out, mount hero ----
  const handleContinue = useCallback(() => {
    if (phase !== "intro" || !continueReady) return;

    // Kick off the first song *inside* this tap so the browser treats it as
    // a user gesture — the only reliable way to start audio on strict
    // platforms (iOS Safari). <MusicPlayer /> adopts this same element.
    try {
      const audio = getSharedAudio();
      if (!audio.src) audio.src = normalizeSrc(songs[0].src);
      audio.volume = playerOptions.volume;
      void audio.play().catch(() => {});
    } catch {
      /* ignore — player will retry on its own */
    }

    if (introOptions.rememberHeroSession) {
      // Tab-scoped flag — auto-cleared when the browser is fully closed.
      // Reloads during the same session will skip click-to-continue.
      setHeroSessionFlag();
    }
    setIntroFadingOut(true);
    setPhase("hero");
    window.requestAnimationFrame(() => setHeroVisible(true));
    window.setTimeout(
      () => setIntroMounted(false),
      INTRO_FADE_OUT_MS + 100
    );
  }, [phase, continueReady]);

  const onContinueKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleContinue();
      }
    },
    [handleContinue]
  );

  return (
    <>
      {phase === "hero" && <Hero visible={heroVisible} />}
      {phase === "hero" && <TrailingCursor />}
      {introMounted && (
        <IntroScreen
          lines={bootLines}
          stage={introStage}
          skip={skipIntro}
          fadingOut={introFadingOut}
          gated={bootGate}
          onContinue={handleContinue}
          onKey={onContinueKey}
          transitionDuration={TRANSITION_DURATION_MS}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/** Renders boot-line text, coloring "Green" in green. */
function renderBootLineText(text: string): React.ReactNode {
  if (!text) return "\u00A0";
  if (!text.includes("Green")) return text;

  const parts = text.split(/(Green)/g);
  return parts.map((part, i) =>
    part === "Green" ? (
      <span key={i} className={styles.green}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/* ------------------------------------------------------------------ */
function IntroScreen({
  lines,
  stage,
  skip,
  fadingOut,
  gated,
  onContinue,
  onKey,
  transitionDuration,
}: {
  lines: string[];
  stage: IntroStage;
  skip: boolean;
  fadingOut: boolean;
  gated: boolean;
  onContinue: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  transitionDuration: number;
}) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const interactive = stage === "transitioned" && !fadingOut && !gated;

  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <section
      className={[
        styles.introScreen,
        skip ? styles.introSkip : "",
        stage === "transitioned" ? styles.introTransitioned : "",
        fadingOut ? styles.introFadingOut : "",
        gated ? styles.introGated : "",
        interactive ? styles.introScreenInteractive : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        // Keep CSS in sync with the JS transition timing
        { "--intro-transition-ms": `${transitionDuration}ms` } as React.CSSProperties
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? "click to continue" : undefined}
      onClick={interactive ? onContinue : undefined}
      onKeyDown={interactive ? onKey : undefined}
    >
      {/* yorha_bg — initial backdrop during boot. Hidden in skip mode. */}
      {!skip && <div className={styles.yorhaBg} aria-hidden="true" />}

      {/* nier_bg — crossfades in once the boot finishes (or shown directly in skip mode). */}
      <div className={styles.nierBg} aria-hidden="true" />

      {!skip && (
        <div ref={consoleRef} className={styles.bootConsole}>
          {lines.map((line, i) => (
            <div key={i} className={styles.bootLine}>
              {renderBootLineText(line)}
            </div>
          ))}
          <div className={styles.bootCursor}>
            <span>_</span>
          </div>
        </div>
      )}

      <div className={styles.continueInner}>
        <span className={styles.signatureText}>luca</span>
        <span className={styles.continueText}>click to continue</span>
      </div>
    </section>
  );
}
