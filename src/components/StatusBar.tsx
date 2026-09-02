import { useEffect, useState } from "react";

function fmtUp(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}m`;
  return `${m}m${String(s % 60).padStart(2, "0")}s`;
}

type Props = {
  cwd: string;
  themeLabel: string;
  matrixOn: boolean;
  startTime: number;
};

export default function StatusBar({ cwd, themeLabel, matrixOn, startTime }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const d = new Date(now);
  const clock = [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

  return (
    <footer className="panel flex h-8 shrink-0 items-center justify-between gap-4 overflow-hidden px-3 text-[11px] text-dim">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="acc animate-pulse text-[9px]">●</span>
          <span className="acc">ONLINE</span>
        </span>
        <span className="text-faint">│</span>
        <span className="hidden sm:inline">guest@terminalweb</span>
        <span className="truncate text-cy">{cwd}</span>
        <span className="text-faint">│</span>
        <span className="hidden md:inline">
          git:<span className="acc">main</span> · clean
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden sm:inline">
          MATRIX:<span className={matrixOn ? "acc" : "text-faint"}>{matrixOn ? "ON" : "OFF"}</span>
        </span>
        <span>
          PHOSPHOR:<span className="acc">{themeLabel}</span>
        </span>
        <span className="hidden md:inline">UP {fmtUp(now - startTime)}</span>
        <span className="text-faint">│</span>
        <span className="tabular-nums text-ink">{clock}</span>
      </div>
    </footer>
  );
}
