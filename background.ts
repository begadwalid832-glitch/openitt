interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
}

/** Slow floating embers / stars for the black background. */
export class Particles {
  private items: Particle[] = [];

  constructor(private readonly count = 110) {}

  resize(w: number, h: number): void {
    this.items = Array.from({ length: this.count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 14 + 4),
      phase: Math.random() * Math.PI * 2,
    }));
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void {
    for (const p of this.items) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;

      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.2 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 150, 170, ${0.45 * twinkle})`;
      ctx.fill();
    }
  }
}
