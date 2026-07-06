/**
 * Visual options — tweak these values to tune how the hero looks.
 * Saved + live on next reload / hot-refresh. No other file needs to change.
 */
export const videoOptions = {
  /** CSS brightness applied to the background video.
   *  1 = untouched, <1 = darker (helps text stay readable). */
  brightness: 0.85,
  /** Dark gradient strength laid over the video, top→bottom (0..1). */
  overlayDarkness: 0.35,
  /** Film grain overlay opacity. 0 = off, 0.15 = heavy grain. */
  grainOpacity: 0.05,
};

/** Inline CSS filter string for the background <video>. */
export function buildVideoFilter(): string {
  return `brightness(${videoOptions.brightness})`;
}

/** Inline gradient laid over the video for text legibility. */
export function buildOverlay(): string {
  return `linear-gradient(180deg, rgba(5, 6, 10, 0.15) 0%, rgba(5, 6, 10, ${videoOptions.overlayDarkness}) 100%)`;
}

/* =========================================================
   UI options — tune the menu / hover / separators / name
   ========================================================= */
export const uiOptions = {
  /** Opacity of the little 01, 02, 03 numbers next to each menu item (0..1). */
  numberOpacity: 0.15,

  /** How wide the menu is in px — also controls hover highlight width
   *  and the length of the top/bottom separator lines. */
  menuWidth: 265,

  /** Menu-label hover colour (when the button is being pointed at) */
  labelHoverColor: "#ffffff",

  /** Gap between the letters of the hero name, in em.
   *  Negative values pull letters tighter, positive spreads them out. */
  nameLetterSpacing: 0.06,

  /** Mouse-parallax wobble strength multiplier for the WHOLE UI.
   *  1 = base amount, 1.5 = 50% heavier, 2 = double, 0.5 = half, 0 = disabled. */
  wobbleStrength: 1.4,

  /** Separate wobble strength for left/right movement (X-axis). */
  wobbleXStrength: 0.45,

  /** Separate wobble strength for up/down movement (Y-axis). */
  wobbleYStrength: 1.0,

  /** How smooth / floaty the wobble feels (0.01..1).
   *  Lower = longer, lazier trail. Higher = snaps tightly to the mouse.
   *  Default = 0.055. Try 0.03 for dreamy, 0.12 for responsive. */
  wobbleSmoothness: 0.055,
};

/* =========================================================
   Intro / loading-screen options
   ========================================================= */
export const introOptions = {
  /** Whether to play the YoRHa-style boot intro before click-to-continue.
   *  - true  : show the full boot sequence on first visit, then click-to-continue.
   *  - false : skip the boot entirely; users go straight to click-to-continue. */
  includeIntro: true,

  /** When true, save a `viewedIntro` cookie after the boot finishes so the
   *  intro only plays once per browser. Subsequent visits go straight to
   *  click-to-continue.
   *  Set to false during local development if you want to see the full
   *  intro on every reload. */
  rememberIntroSeen: false,

  /** When true, save a session cookie (`heroSession`) after the user clicks
   *  continue, so reloading the page during the same browser session keeps
   *  them on the hero (skips click-to-continue). The cookie clears
   *  automatically when the page is fully closed.
   *  Set to false during local development if you want to see
   *  click-to-continue on every reload. */
  rememberHeroSession: true,
};

/** Converts ui options to inline style CSS vars for the hero root */
export function uiStyleVars(): React.CSSProperties {
  return {
    // @ts-expect-error CSS custom properties
    "--num-opacity": String(uiOptions.numberOpacity),
    "--menu-width": `${uiOptions.menuWidth}px`,
    "--label-hover-color": uiOptions.labelHoverColor,
    "--name-letter-spacing": `${uiOptions.nameLetterSpacing}em`,
    "--wobble": String(uiOptions.wobbleStrength),
    "--wobble-x": String(uiOptions.wobbleXStrength),
    "--wobble-y": String(uiOptions.wobbleYStrength),
  };
}

/* =========================================================
   About / Socials section options
   ========================================================= */
export const aboutSectionOptions = {
  // ---- Name ("luca.") ----
  /** Font size in vw — drives the responsive scaling. */
  nameSizeVw: 5.8,
  /** Minimum font size in px (small screens). */
  nameSizeMin: 46,
  /** Maximum font size in px (large screens). */
  nameSizeMax: 78,
  /** Letter-spacing in em — higher = more stretched. */
  nameLetterSpacing: 0.02,

  // ---- Bio ----
  /** Bio paragraph font size in px. */
  bioFontSize: 15,
  /** Max width of the bio text in px — controls line breaks. */
  bioMaxWidth: 580,

  // ---- Avatar ----
  /** Avatar circle diameter in px. */
  avatarSize: 76,

  // ---- Stack icons ----
  /** Width / height of each tech-stack icon in px. */
  iconSize: 24,

  // ---- Section label ----
  /** Length of the horizontal rule before the label text, in px. */
  labelRuleWidth: 28,
  /** Opacity of the rule line and label text (0..1). */
  labelOpacity: 0.3,

  // ---- "hey, i'm" sub-label ----
  /** Font size of "hey, i'm" in px. */
  heyImFontSize: 18,
  /** How much the "luca." name overlaps "hey, i'm" (negative = pulls name up).
   *  -30 = very tight (can overlap at some sizes). -12 = safe default. 0 = no overlap. */
  nameTopMargin: -12,
  /** Pushes the whole profile row (avatar + name) down from the label, in px.
   *  Negative = higher, positive = lower. */
  profileMarginTop: 6,
  /** Extra top margin on the name+heyIm block relative to the avatar, in px. */
  heyImMarginTop: 22,

  // ---- Card vertical offsets ----
  /** Push the About card down by this many px (positive = lower). */
  aboutCardTopOffset: 48,
  /** Push the Socials card up by this many px (negative = higher). */
  socialsCardTopOffset: 0,

  // ---- Layout ----
  /** Gap between the About card and Find-me-at card in px. */
  cardsGap: 160,
  /** Left-side padding of the whole row — shifts both cards. */
  rowPaddingLeft: 0,
  /** Nudges the About card left by this many px (independent of the grid). */
  aboutCardLeftNudge: 98,
  /** Nudges the Socials card right by this many px (independent of the grid). */
  socialsCardRightNudge: 52,

  // ---- Scale ----
  /** Uniform scale applied to the About card (1 = normal, 1.1 = 10% bigger). */
  aboutCardScale: 1.08,

  // ---- Hover 3D tilt ----
  /** Base rotateY when hovering the About card (deg). Negative = left side forward. */
  aboutHoverTiltY: 7,
  /** Mouse variation on top of the base tilt (deg). 0 = rigid, 4 = wobbly. */
  aboutHoverMouseRange: 3,
  /** Base rotateY when hovering the Socials card (deg). Positive = right side forward. */
  socialsHoverTiltY: -7,
  /** Mouse variation on top of the base tilt (deg). */
  socialsHoverMouseRange: 3,
};

/* =========================================================
   Scroll overlay options — dark tint over the content sections
   ========================================================= */
export const scrollOverlayOptions = {
  // ---- Opacity curve — keyframes ----
  // Each stop: vh = scroll depth as a multiple of viewport height,
  //            opacity = overlay darkness at that point (0..1).
  // Stops must be in ascending vh order. Interpolation is linear between stops.
  // Examples:
  //   { vh: 0,    opacity: 0    }  — fully transparent at page top
  //   { vh: 0.15, opacity: 0    }  — stay transparent until 15 % scrolled
  //   { vh: 0.45, opacity: 0.44 }  — 44 % dark at 45 % scroll
  //   { vh: 1.1,  opacity: 0.88 }  — 88 % dark once past first viewport
  // Overlay disabled — background stays identical at every scroll depth.
  // To bring the darkening back, restore stops like:
  //   { vh: 0, opacity: 0 }, { vh: 0.5, opacity: 0.26 }, { vh: 1.1, opacity: 0.75 }
  fadeStops: [
    { vh: 0, opacity: 0 },
  ] as { vh: number; opacity: number }[],

  // ---- Colour ----
  /** RGB triplet. Default dark-blue: [5, 8, 22]. Pure black: [0,0,0]. */
  color: [5, 8, 22] as [number, number, number],

  // ---- Audio muffling ----
  /** Enable low-pass filter on music while overlay is active. */
  muffle: true,
  /** Low-pass cutoff at max overlay opacity (Hz). Lower = more muffled.
   *  600 = subtle · 250 = heavy · 100 = extreme. */
  /** Low-pass cutoff at max muffle (Hz). 400 = subtle · 200 = heavy · 80 = underwater. */
  muffleFrequency: 1600,
  /** Cutoff when overlay is fully off (no muffle). */
  muffleOpenFrequency: 18000,
  /** Filter Q at max muffle — resonance peak.
   *  0 = flat · 4 = wall · 8 = underwater · 14 = extreme. */
  muffleQ: 0.8,
  /** Seconds for the filter to glide to a new value (laggy = more gradual). */
  muffleSmoothing: 0.4,
  /** Volume at max muffle (0..1). Underwater sounds quieter too. */
  muffleGain: 0.9,
  /** Power-curve exponent applied to the overlay t (0..1) before driving the
   *  filter. < 1 = muffle builds faster in the middle of the scroll range,
   *  but never exceeds the max settings. 1 = linear. 0.65 = noticeably
   *  progressive without being heavier at the end. */
  muffleCurve: 0.88,
};

/* =========================================================
   Music-player options
   ========================================================= */

export type PlayerPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export const playerOptions = {
  /** Which corner of the hero the music player anchors to. */
  position: "bottom-right" as PlayerPosition,

  /** Total player column width (px). Disc, title, scrubber and controls
   *  all align to this. Smaller = more compact. */
  playerWidth: 185,

  /** Diameter of the spinning vinyl disc (px). */
  discSize: 90,

  /** Cover art circle as a % of the disc diameter (0..100).
   *  Higher = more of the disc is cover, less vinyl ring shows.
   *  Default = 58. Ignored when fullDiscCover is true. */
  coverSize: 58,

  /** When true, the cover image fills the entire disc instead of just
   *  the inner circle. The vinyl grooves + shine still overlay on top. */
  fullDiscCover: true,

  /** Distance from the chosen horizontal edge (px).
   *  null = use the viewport-responsive default (clamp 28..80px). */
  edgeOffsetX: null as number | null,

  /** Distance from the chosen vertical edge (px).
   *  null = use the viewport-responsive default. */
  edgeOffsetY: null as number | null,

  /** Default audio volume (0..1). Tracks all start at this volume. */
  volume: 0.18,

  /** Optional fallback cover used for songs that don't define `cover`
   *  in songs.config.ts. Accepts the same path styles as song paths
   *  (web URL, "images\\foo.png", or absolute Windows path).
   *  Leave as "" to fall back to the disc-letter placeholder. */
  defaultCover: "" as string,

  /** Show the title under the disc? */
  showTitle: true,

  /** Show the scrubber + time row? */
  showProgress: true,
};

/* =========================================================
   Projects section options
   ========================================================= */
export const projectsOptions = {
  /** Enable mouse parallax on the My Work section. */
  parallaxEnabled: true,

  /** How many px the cards shift at full edge-to-edge mouse movement.
   *  Higher = more dramatic float. 0 = disable movement. */
  parallaxStrength: 14,

  /** Smoothness of the parallax trail (0.01 = dreamy/slow, 0.12 = snappy).
   *  Lower = longer, floatier lag. */
  parallaxSmoothness: 0.055,

  /** Depth layering — label moves at 0.3×, cards at 1×, footer at 0.5×.
   *  Set to false for uniform movement on all layers. */
  parallaxDepth: true,
};

/** CSS-vars + data attributes for the music player root.
 *  Read in MusicPlayer.module.css to drive size + position. */
export function playerStyleVars(): React.CSSProperties {
  const vars: Record<string, string> = {
    "--player-width": `${playerOptions.playerWidth}px`,
    "--disc-size": `${playerOptions.discSize}px`,
    "--cover-size": `${playerOptions.coverSize}%`,
  };
  if (playerOptions.edgeOffsetX != null) {
    vars["--player-edge-x"] = `${playerOptions.edgeOffsetX}px`;
  }
  if (playerOptions.edgeOffsetY != null) {
    vars["--player-edge-y"] = `${playerOptions.edgeOffsetY}px`;
  }
  return vars as React.CSSProperties;
}
