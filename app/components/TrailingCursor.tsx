"use client";

import { useEffect } from "react";

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

const MAX_PARTICLES = 140;
/** Minimum cursor travel (px) between spawned stars. */
const SPAWN_SPACING = 9;
const STAR_COLOR = "220, 225, 255";

/**
 * Star-trail cursor — the normal system cursor stays visible; moving the
 * mouse sheds small glowing stars that drift toward the lower-left (same
 * direction as the starfield background) while fading out.
 */
export default function TrailingCursor() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let particles: StarParticle[] = [];
    let lastX = -1;
    let lastY = -1;
    let rafId = 0;
    let lastTime = performance.now();

    const spawn = (x: number, y: number) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        // Gentle drift down-left, echoing the background stars
        vx: -8 - Math.random() * 18,
        vy: 10 + Math.random() * 22,
        life: 0,
        maxLife: 0.22 + Math.random() * 0.22,
        size: 0.8 + Math.random() * 1.8,
      });
      if (particles.length > MAX_PARTICLES) particles.shift();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (lastX < 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        spawn(e.clientX, e.clientY);
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      if (dist >= SPAWN_SPACING) {
        // Spawn along the travelled path so fast swipes leave a full trail
        const steps = Math.min(4, Math.floor(dist / SPAWN_SPACING));
        for (let i = 1; i <= steps; i++) {
          spawn(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
        }
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const drawStar = (x: number, y: number, r: number, alpha: number) => {
      // Soft glow core
      ctx.beginPath();
      ctx.fillStyle = `rgba(${STAR_COLOR}, ${(alpha * 0.25).toFixed(3)})`;
      ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(${STAR_COLOR}, ${alpha.toFixed(3)})`;
      ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      // 4-point sparkle cross
      ctx.strokeStyle = `rgba(${STAR_COLOR}, ${(alpha * 0.85).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - r * 2.6, y);
      ctx.lineTo(x + r * 2.6, y);
      ctx.moveTo(x, y - r * 2.6);
      ctx.lineTo(x, y + r * 2.6);
      ctx.stroke();
    };

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      particles = particles.filter((p) => p.life < p.maxLife);
      for (const p of particles) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const t = p.life / p.maxLife;
        const alpha = (1 - t) * (1 - t); // ease-out fade
        drawStar(p.x, p.y, p.size * (1 - t * 0.5), alpha);
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

  return null;
}
