import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "TERMINALWEB BIOS v2.5.0 — (c) 2026 Terminalweb Foundry",
  "CPU0 : JavaScript V8 @ 60fps .................... OK",
  "MEM  : 512K conventional, ∞ virtual ............. OK",
  "GPU  : CSS compositing layer .................... OK",
  "NET  : uplink to /dev/web ....................... OK",
  "Mounting /home/guest/terminalweb ................ OK",
  "Loading twsh 2.5.0 (shell kernel) ............... OK",
  "Compiling glyph atlas [██████████████] 100%",
  "Starting glyphcore daemon ....................... OK",
  "Starting netpulse monitor ....................... OK",
  "Phosphor warm-up ................................ OK",
  "Handing off to twsh …",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c >= BOOT_LINES.length) {
          clearInterval(iv);
          return c;
        }
        return c + 1;
      });
    }, 130);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(iv);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (count >= BOOT_LINES.length) {
      const t = setTimeout(finish, 620);
      return () => clearTimeout(t);
    }
  }, [count]);

  const pct = Math.round((count / BOOT_LINES.length) * 100);

  return (
    <div
      className="fixed inset-0 z-[80] flex cursor-pointer flex-col justify-center bg-[#05080a] px-6 md:px-24"
      onClick={finish}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-2 text-[11px] tracking-[0.3em] text-dim">FOUNDRY FIRMWARE · REV 2.5.0</div>
        <h1 className="t-glow acc font-disp text-6xl leading-none tracking-wider md:text-8xl">
          TERMINALWEB
        </h1>
        <div className="mt-2 mb-8 text-[12px] text-dim">
          cold boot <span className="acc">▸</span> phosphor self-test in progress
        </div>

        <div className="h-3 w-full border border-line bg-panel p-[2px]">
          <div
            className="stripes h-full transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-dim">
          <span>POST</span>
          <span className="acc">{pct}%</span>
        </div>

        <div className="mt-8 min-h-[240px] text-[12.5px] leading-6 text-ink/85">
          {BOOT_LINES.slice(0, count).map((l, i) => (
            <div key={i} className="bootline whitespace-pre-wrap">
              <span className="mr-2 text-faint">{String(i).padStart(2, "0")}</span>
              {l.endsWith("OK") ? (
                <>
                  {l.slice(0, -2)}
                  <span className="acc font-semibold">OK</span>
                </>
              ) : (
                <span className={i === BOOT_LINES.length - 1 ? "acc" : undefined}>{l}</span>
              )}
            </div>
          ))}
          {count < BOOT_LINES.length && <span className="caret">▊</span>}
        </div>

        <div className="mt-8 text-[11px] tracking-[0.25em] text-faint">
          PRESS ANY KEY TO SKIP <span className="caret acc">▊</span>
        </div>
      </div>
    </div>
  );
}
