import { useEffect, useRef } from "react";

const GLYPHS = "アカサタナハマヤラワ01<>/#$%&*+=?█▓▒░";

export default function MatrixRain({ accent }: { accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = 15 * dpr;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const cols = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 66) return;
      last = t;
      ctx.fillStyle = "rgba(6,10,12,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.975 ? "#eafff4" : accent;
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.976) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [accent]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-20" />;
}
