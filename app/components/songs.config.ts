/**
 * Songs config
 * ============
 * Tracks for the music player. Files live under /public, so paths are
 * site-relative (e.g. "/sfx/track.mp3", "/images/cover.jpg").
 * Cover art is optional — without it a stylised fallback disc is shown.
 */

export interface Song {
  /** Display name shown under the disc. */
  name: string;
  /** Path to the audio file. */
  src: string;
  /** Optional path to the cover-art image (square works best). */
  cover?: string;
}

export const songs: Song[] = [
  {
    name: "Lucki - Limerence",
    src: "/sfx/lucki2.mp3",
    cover: "/images/grimoire_weiss.jpg",
  },
  {
    name: "Say Slatt say Ski (lucki)",
    src: "/sfx/lucki.mp3",
    cover: "/images/stellar_blade.jpg",
  },
  {
    name: "Kaine - Salvation",
    src: "/sfx/kaine-salvation.mp3",
    cover: "/images/grimoire_weiss.jpg",
  },
];

/** Normalises a configured path into a web-served URL:
 *  full URLs pass through, backslashes become slashes, and a leading
 *  slash is ensured so the browser treats it as site-relative. */
export function normalizeSrc(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  let s = src.trim().replace(/\\/g, "/");
  if (!s.startsWith("/")) s = "/" + s;
  return s.replace(/^\/public\//, "/");
}
