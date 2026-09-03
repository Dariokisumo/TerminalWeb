import { useRef, useState } from "react";
import BootScreen from "./components/BootScreen";
import MatrixRain from "./components/MatrixRain";
import PublishModal from "./components/PublishModal";
import StatusBar from "./components/StatusBar";
import Terminal, { type TermHandle } from "./components/Terminal";
import { FilesPanel, NetPanel, SystemPanel } from "./components/SidePanels";
import { getNode, toSegments } from "./data/fs";
import { THEMES, type ThemeName } from "./lib/commands";

export default function App() {
  const [theme, setTheme] = useState<ThemeName>("green");
  const [matrixOn, setMatrixOn] = useState(false);
  const [booting, setBooting] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [cwd, setCwd] = useState("~");
  const [session, setSession] = useState(0);
  const [startTime, setStartTime] = useState(() => Date.now());
  const termRef = useRef<TermHandle>(null);

  const acc = THEMES[theme].acc;

  const reboot = () => {
    setMatrixOn(false);
    setBooting(true);
    setCwd("~");
    setStartTime(Date.now());
    setSession((s) => s + 1);
  };

  const handleFileOpen = (displayPath: string) => {
    const node = getNode(toSegments(displayPath));
    if (!node) return;
    if (node.type === "dir") termRef.current?.run(`cd ${displayPath}`);
    else termRef.current?.run(`cat ${displayPath}`);
    termRef.current?.focus();
  };

  return (
    <div
      className="h-full w-full overflow-hidden bg-[#060a0c] text-[13.5px] leading-relaxed text-ink"
      style={{ "--acc": acc, "--acc-rgb": THEMES[theme].rgb } as React.CSSProperties}
    >
      <div className="fx pointer-events-none fixed inset-0 z-0" />
      <div className="scanband" />
      <div className="gridbg pointer-events-none fixed inset-0 z-0" />
      {matrixOn && <MatrixRain accent={acc} />}

      <div className="relative z-10 h-full overflow-auto p-3 md:p-6">
        <div key={session} className="mx-auto flex h-full max-w-[1500px] flex-col gap-3 md:gap-4">
          {/* ---- header ---- */}
          <header className="panel flex shrink-0 items-center gap-3 px-4 py-2.5">
            <div className="sig flex items-end gap-[2px]" aria-hidden>
              <i style={{ height: 6 }} />
              <i style={{ height: 10 }} />
              <i style={{ height: 14 }} />
              <i style={{ height: 18 }} />
            </div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="t-glow acc font-disp text-[26px] leading-none tracking-[0.08em]">
                TERMINALWEB
              </h1>
              <span className="text-[10px] tracking-[0.22em] text-dim">v2.4.1 · twsh</span>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button
                onClick={() => setPublishOpen(true)}
                title="guided publish to github"
                className="mr-1 flex items-center gap-1.5 border border-[color:var(--acc)] bg-[color:var(--acc)]/10 px-2.5 py-1 font-disp text-[16px] leading-none tracking-widest transition-all duration-200 hover:bg-[color:var(--acc)]/25 hover:shadow-[0_0_18px_rgba(var(--acc-rgb),0.4)]"
                style={{ color: "var(--acc)" }}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 10.5V3M5 6l3-3 3 3M3 11v2.5h10V11" />
                </svg>
                PUBLISH
              </button>
              <span className="mr-1 hidden text-[10px] tracking-widest text-faint sm:inline">
                PHOSPHOR
              </span>
              {(Object.keys(THEMES) as ThemeName[]).map((t) => (
                <button
                  key={t}
                  title={THEMES[t].label}
                  onClick={() => setTheme(t)}
                  aria-label={`theme ${THEMES[t].label}`}
                  className={
                    "h-4 w-4 border transition-all duration-200 " +
                    (theme === t
                      ? "scale-110 border-white/70"
                      : "border-line hover:scale-110 hover:border-white/40")
                  }
                  style={{
                    background: THEMES[t].acc,
                    boxShadow: theme === t ? `0 0 12px ${THEMES[t].acc}` : "none",
                  }}
                />
              ))}
              <span className="mx-1 h-5 w-px bg-line" />
              <button
                onClick={reboot}
                title="cold restart"
                className="flex items-center gap-1.5 border border-line bg-panel px-2.5 py-1 text-[11px] text-dim transition-colors hover:border-[color:var(--acc)] hover:text-[color:var(--acc)]"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3.2h-3.2" />
                </svg>
                RESTART
              </button>
            </div>
          </header>

          {/* ---- workspace ---- */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:gap-4 xl:grid-cols-[1fr_330px]">
            <Terminal
              ref={termRef}
              booted={!booting}
              cwd={cwd}
              setCwd={setCwd}
              theme={theme}
              setTheme={setTheme}
              matrixOn={matrixOn}
              toggleMatrix={() => setMatrixOn((m) => !m)}
              reboot={reboot}
              startTime={startTime}
            />
            <div className="flex min-h-0 flex-col gap-3 md:gap-4">
              <SystemPanel matrixOn={matrixOn} />
              <NetPanel />
              <FilesPanel onOpen={handleFileOpen} />
            </div>
          </div>

          {/* ---- status bar ---- */}
          <StatusBar
            cwd={cwd}
            themeLabel={THEMES[theme].label}
            matrixOn={matrixOn}
            startTime={startTime}
          />
        </div>
      </div>

      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />

      {booting && <BootScreen onDone={() => setBooting(false)} />}
    </div>
  );
}
