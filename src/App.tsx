import { useRef, useState, type CSSProperties } from "react";
import BootScreen from "./components/BootScreen";
import MatrixRain from "./components/MatrixRain";
import StatusBar from "./components/StatusBar";
import Terminal, { type TermHandle } from "./components/Terminal";
import { FilesPanel, NetPanel, SystemPanel } from "./components/SidePanels";
import { THEMES, type ThemeName } from "./lib/commands";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("green");
  const [matrixOn, setMatrixOn] = useState(false);
  const [cwd, setCwd] = useState("~");
  const [startTime] = useState(() => Date.now());
  const termRef = useRef<TermHandle>(null);

  const t = THEMES[theme];
  const vars = { "--acc": t.acc, "--acc-rgb": t.rgb } as CSSProperties;

  const reboot = () => {
    termRef.current?.clear();
    setBooted(false);
  };

  return (
    <div className="fx relative h-full overflow-hidden font-mono text-ink" style={vars}>
      {/* ambient layers */}
      <div className="gridbg absolute inset-0 z-0" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(640px 420px at 10% -6%, rgba(var(--acc-rgb),0.10), transparent 70%), radial-gradient(760px 540px at 104% 108%, rgba(86,200,255,0.07), transparent 70%), radial-gradient(520px 420px at 88% -8%, rgba(215,140,255,0.05), transparent 70%)",
        }}
      />
      {matrixOn && <MatrixRain accent={t.acc} />}
      <div className="scanband" />

      {/* frame */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1560px] flex-col gap-3 p-3 md:p-4">
        {/* header */}
        <header className="panel flex h-12 shrink-0 items-center justify-between gap-3 px-3 md:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <svg viewBox="0 0 24 24" className="acc h-5 w-5 shrink-0" fill="none" aria-hidden>
              <path
                d="M5 7l6 5-6 5M13 17h6"
                stroke="var(--acc)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="t-glow acc truncate font-disp text-[26px] leading-none tracking-[0.08em] md:text-3xl">
              TERMINALWEB
            </h1>
            <span className="hidden border border-line px-1.5 py-0.5 text-[10px] tracking-widest text-dim sm:inline">
              twsh·2.4.1
            </span>
            <span className="hidden text-[10px] tracking-widest text-faint md:inline">
              // the repo you can talk to
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <span className="sig mr-1 hidden items-end sm:flex" aria-hidden>
              <i className="h-[5px]" />
              <i className="h-[8px]" />
              <i className="h-[11px]" />
              <i className="h-[14px]" />
            </span>

            {/* phosphor switcher */}
            <div className="flex items-center gap-1 border border-line p-1">
              {(Object.keys(THEMES) as ThemeName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  title={`phosphor: ${name}`}
                  onClick={() => setTheme(name)}
                  className={`flex h-5 w-6 items-center justify-center border transition-all duration-150 ${
                    theme === name
                      ? "border-[rgba(var(--acc-rgb),0.7)] bg-[rgba(var(--acc-rgb),0.12)]"
                      : "border-transparent hover:border-line"
                  }`}
                >
                  <i
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: THEMES[name].acc,
                      boxShadow: theme === name ? `0 0 8px ${THEMES[name].acc}` : "none",
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setMatrixOn((m) => !m);
                termRef.current?.focus();
              }}
              className={`border px-2 py-1 text-[11px] tracking-wider transition-all duration-150 ${
                matrixOn
                  ? "acc border-[rgba(var(--acc-rgb),0.7)] bg-[rgba(var(--acc-rgb),0.12)] shadow-[0_0_14px_rgba(var(--acc-rgb),0.3)]"
                  : "border-line text-dim hover:border-[rgba(var(--acc-rgb),0.5)] hover:text-[var(--acc)]"
              }`}
            >
              MATRIX
            </button>

            <button
              type="button"
              onClick={reboot}
              title="cold reboot"
              className="group flex h-[26px] w-[26px] items-center justify-center border border-line text-dim transition-all duration-150 hover:border-[rgba(var(--acc-rgb),0.5)] hover:text-[var(--acc)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-[260deg]"
                fill="none"
                aria-hidden
              >
                <path
                  d="M20 12a8 8 0 1 1-2.34-5.66M20 3v5h-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* main */}
        <main className="flex min-h-0 flex-1 gap-3">
          <Terminal
            ref={termRef}
            booted={booted}
            cwd={cwd}
            setCwd={setCwd}
            theme={theme}
            setTheme={setTheme}
            matrixOn={matrixOn}
            toggleMatrix={() => setMatrixOn((m) => !m)}
            reboot={reboot}
            startTime={startTime}
          />

          <aside className="term-scroll hidden w-[302px] shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
            <SystemPanel matrixOn={matrixOn} />
            <NetPanel />
            <FilesPanel
              onOpen={(p) => {
                termRef.current?.run(`cat ${p}`);
                termRef.current?.focus();
              }}
            />
            <div className="panel px-3 py-2 text-[10.5px] leading-5 text-faint">
              <span className="acc">tip</span> — every panel is live. try{" "}
              <span className="text-dim">`theme amber`</span>, <span className="text-dim">`ping`</span> or{" "}
              <span className="text-dim">`sudo rm -rf /`</span>
            </div>
          </aside>
        </main>

        {/* status bar */}
        <StatusBar cwd={cwd} themeLabel={t.label} matrixOn={matrixOn} startTime={startTime} />
      </div>

      {/* boot overlay */}
      {!booted && <BootScreen onDone={() => setBooted(true)} />}
    </div>
  );
}
