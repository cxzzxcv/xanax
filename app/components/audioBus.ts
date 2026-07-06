"use client";

/**
 * App-wide singleton <audio> element.
 *
 * The music player and the "click to continue" handler share ONE element so
 * that playback can be started from inside the continue tap — a genuine user
 * gesture. Browsers (especially iOS Safari) only allow audio to start from
 * within a gesture, and by the time <MusicPlayer /> mounts the tap is already
 * over. Priming this shared element during the tap keeps the first song
 * playing on every platform.
 */
let sharedAudio: HTMLAudioElement | null = null;

export function getSharedAudio(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("getSharedAudio() must only be called in the browser");
  }
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}
