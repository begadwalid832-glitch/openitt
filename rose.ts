/** World size the rose is designed in. The canvas scales it to fit any screen. */
export const WORLD = { w: 400, h: 600 };
export const BASE = { x: 200, y: 585 }; // where the stem ends (sway pivot)
export const HEAD = { x: 200, y: 185 }; // centre of the bloom (glow position)

export interface Piece {
  path: Path2D;
  z: number; // paint order (back to front)
  px: number; // pivot x (piece centre)
  py: number; // pivot y
  g: [number, number, number, number]; // gradient line x0,y0,x1,y1
  light: string;
  dark: string;
  delay: number; // seconds before this piece starts flying in
  dur: number; // flight time in seconds
  sx: number; // start offset x
  sy: number; // start offset y
  srot: number; // start rotation (radians)
}

const rand = (a: number, b: number): number => a + Math.random() * (b - a);
export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));
const easeOutCubic = (k: number): number => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k: number): number => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

function make(
  path: Path2D,
  z: number,
  px: number,
  py: number,
  g: [number, number, number, number],
  light: string,
  dark: string,
): Piece {
  const angle = rand(0, Math.PI * 2);
  const dist = rand(260, 520);
  return {
    path, z, px, py, g, light, dark,
    delay: 0,
    dur: rand(0.9, 1.3),
    sx: Math.cos(angle) * dist,
    sy: Math.sin(angle) * dist + 120,
    srot: rand(-3, 3),
  };
}

function stem(): Piece[] {
  const out: Piece[] = [];
  const segments = 7;
  const top = 250;
  const bottom = BASE.y;
  const xAt = (y: number): number => 200 + 16 * Math.sin(((y - top) / (bottom - top)) * Math.PI * 1.2);
  const wAt = (y: number): number => 5 + (4 * (y - top)) / (bottom - top);

  for (let i = 0; i < segments; i++) {
    const y0 = top + ((bottom - top) * i) / segments;
    const y1 = top + ((bottom - top) * (i + 1)) / segments + 1;
    const x0 = xAt(y0), x1 = xAt(y1), w0 = wAt(y0), w1 = wAt(y1);
    const p = new Path2D();
    p.moveTo(x0 - w0, y0);
    p.lineTo(x0 + w0, y0);
    p.lineTo(x1 + w1, y1);
    p.lineTo(x1 - w1, y1);
    p.closePath();
    // little puzzle knob
    p.moveTo(x1 + 4.5, y1 - 1);
    p.arc(x1, y1 - 1, 4.5, 0, Math.PI * 2);
    const cy = (y0 + y1) / 2;
    out.push(make(p, 0, xAt(cy), cy, [x0 - w0, cy, x0 + w0, cy], "#3aa356", "#0f4a22"));
  }
  return out;
}

function leaf(x: number, y: number, dir: 1 | -1, len: number, wid: number): Piece {
  const p = new Path2D(
    `M${x} ${y} ` +
      `C${x + dir * len * 0.25} ${y - wid} ${x + dir * len * 0.7} ${y - wid * 1.1} ${x + dir * len} ${y - len * 0.35} ` +
      `C${x + dir * len * 0.8} ${y + wid * 0.3} ${x + dir * len * 0.35} ${y + wid * 0.7} ${x} ${y} Z`,
  );
  const px = x + dir * len * 0.5;
  const py = y - len * 0.15;
  return make(p, 1, px, py, [x, y, x + dir * len, y - len * 0.35], "#4fc16a", "#145c2b");
}

function sepals(): Piece[] {
  const base = new Path2D("M0 0 C-10 10 -14 30 0 56 C14 30 10 10 0 0 Z");
  return [-75, -38, 0, 38, 75].map((deg) => {
    const m = new DOMMatrix().translate(200, 245).rotate(deg);
    const p = new Path2D();
    p.addPath(base, m);
    const rad = (deg * Math.PI) / 180;
    const px = 200 - Math.sin(rad) * -28;
    const py = 245 + Math.cos(rad) * 28;
    return make(p, 2, px, py, [200, 245, px, py + 30], "#2f8f47", "#0c3d1c");
  });
}

const PETAL = new Path2D(
  "M0 0 C-48 -18 -62 -78 -32 -108 C-14 -126 14 -126 32 -108 C62 -78 48 -18 0 0 Z",
);
const PETAL_LEN = 125;

function petal(z: number, deg: number, scale: number, oy: number, light: string, dark: string): Piece {
  const m = new DOMMatrix().translate(HEAD.x, oy).rotate(deg).scale(scale);
  const p = new Path2D();
  p.addPath(PETAL, m);
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  const L = PETAL_LEN * scale;
  return make(
    p, z,
    HEAD.x + dx * L * 0.55, oy + dy * L * 0.55,
    [HEAD.x, oy, HEAD.x + dx * L, oy + dy * L],
    light, dark,
  );
}

/** Builds every puzzle piece of the rose and schedules them bottom -> top. */
export function buildRose(): Piece[] {
  const pieces: Piece[] = [
    ...stem(),
    leaf(205, 440, 1, 120, 38),
    leaf(195, 380, -1, 105, 34),
    ...sepals(),
  ];

  const layers: Array<[number, number[], number, number, string, string]> = [
    // z, angles, scale, originY, light, dark
    [3, [-100, -68, 68, 100], 0.95, 225, "#8f0f24", "#3d0410"],
    [4, [-50, 0, 50], 0.9, 215, "#b3122d", "#5a0617"],
    [5, [-33, 33], 0.76, 210, "#d3182f", "#7a0a1c"],
    [6, [-14, 14], 0.6, 205, "#ec2c45", "#990f26"],
    [7, [0], 0.42, 200, "#ff5670", "#b01530"],
    [8, [-22, 22], 0.28, 196, "#ff8aa0", "#d02a47"],
  ];
  for (const [z, angles, s, oy, light, dark] of layers) {
    for (const a of angles) pieces.push(petal(z, a + rand(-4, 4), s, oy, light, dark));
  }

  // Bottom of the screen first, top last.
  const ys = pieces.map((p) => p.py);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = 4.2;
  for (const p of pieces) {
    p.delay = ((maxY - p.py) / (maxY - minY)) * span + rand(0, 0.25);
  }
  return pieces.sort((a, b) => a.z - b.z);
}

export function totalDuration(pieces: Piece[]): number {
  return Math.max(...pieces.map((p) => p.delay + p.dur));
}

/** Draws every piece at time t (seconds). Call inside the world-space transform. */
export function drawRose(ctx: CanvasRenderingContext2D, pieces: Piece[], t: number): void {
  for (const p of pieces) {
    if (t < p.delay) continue;
    const k = clamp((t - p.delay) / p.dur);
    const move = easeOutCubic(k);
    const snap = easeOutBack(k);

    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 4);
    ctx.translate(p.px + p.sx * (1 - move), p.py + p.sy * (1 - move));
    ctx.rotate(p.srot * (1 - move));
    const s = 0.5 + 0.5 * snap;
    ctx.scale(s, s);
    ctx.translate(-p.px, -p.py);

    const grad = ctx.createLinearGradient(p.g[0], p.g[1], p.g[2], p.g[3]);
    grad.addColorStop(0, p.dark);
    grad.addColorStop(1, p.light);
    ctx.fillStyle = grad;
    ctx.fill(p.path);

    ctx.lineJoin = "round";
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.stroke(p.path);

    // bright "click" when the piece snaps into place
    const after = t - (p.delay + p.dur);
    if (after > 0 && after < 0.5) {
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - after / 0.5) * 0.7})`;
      ctx.stroke(p.path);
    }
    ctx.restore();
  }
}
