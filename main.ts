import { Particles } from "./background";
import { BASE, HEAD, WORLD, buildRose, clamp, drawRose, totalDuration } from "./rose";

const canvas = document.getElementById("stage") as HTMLCanvasElement;
const replayBtn = document.getElementById("replay") as HTMLButtonElement;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D is not supported in this browser.");

const particles = new Particles();
let w = 0;
let h = 0;

function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles.resize(w, h);
}

let pieces = buildRose();
let total = totalDuration(pieces);
let start = performance.now();
let last = start;

function replay(): void {
  pieces = buildRose();
  total = totalDuration(pieces);
  start = performance.now();
  document.body.classList.remove("done");
}

function frame(now: number): void {
  const c = ctx!;
  const t = (now - start) / 1000;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // black background
  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);

  const scale = Math.min(w / WORLD.w, (h * 0.9) / WORLD.h) * 0.9;
  const ox = (w - WORLD.w * scale) / 2;
  const oy = (h - WORLD.h * scale) / 2 - h * 0.02;

  // red glow that grows as the rose comes together
  const progress = clamp(t / total);
  const gx = ox + HEAD.x * scale;
  const gy = oy + HEAD.y * scale;
  const glowR = scale * 340;
  const glow = c.createRadialGradient(gx, gy, 0, gx, gy, glowR);
  const pulse = t > total ? 1 + Math.sin((t - total) * 1.6) * 0.12 : 1;
  glow.addColorStop(0, `rgba(210, 25, 55, ${0.3 * progress * pulse})`);
  glow.addColorStop(1, "rgba(210, 25, 55, 0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, w, h);

  particles.draw(c, w, h, t, dt);

  // rose, with a gentle sway once it is complete
  const sway = t > total ? Math.sin((t - total) * 0.9) * 0.025 * clamp((t - total) / 2) : 0;
  c.save();
  c.translate(ox, oy);
  c.scale(scale, scale);
  c.translate(BASE.x, BASE.y);
  c.rotate(sway);
  c.translate(-BASE.x, -BASE.y);
  drawRose(c, pieces, t);
  c.restore();

  if (t > total + 0.3) document.body.classList.add("done");
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
replayBtn.addEventListener("click", replay);
resize();
requestAnimationFrame(frame);
