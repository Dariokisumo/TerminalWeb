# TerminalWeb

A browser-native terminal experience with a phosphor CRT aesthetic. TerminalWeb simulates a tiny shell in the browser: explore a virtual filesystem, run built-in commands, switch themes, trigger Matrix rain, and package the project for GitHub.

> Nothing is fetched and nothing leaves the tab while you use the shell.

## Features

- Interactive `twsh` terminal with command history, tab completion, and keyboard shortcuts
- Virtual filesystem with `ls`, `cd`, `cat`, `tree`, and more
- Boot sequence, restart control, status panel, and system-style side panels
- Green, amber, and ice phosphor themes
- Optional Matrix rain effect
- Built-in Git and GitHub publishing guidance
- Downloadable project archive through the `repo` command

## Quick start

### Prerequisites

- Node.js 18 or newer
- npm

### Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite in your browser.

### Create a production build

```bash
npm run build
```

### Type-check the project

```bash
npm run typecheck
```

## Using the terminal

When the boot screen completes, type `help` to view every available command.

A few good places to start:

```text
help
neofetch
ls
tree
cat README.md
theme amber
matrix
repo
github
```

Use the up arrow to recall commands, <kbd>Tab</kbd> for completion, and <kbd>Ctrl</kbd> + <kbd>L</kbd> to clear the screen.

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- IBM Plex Mono and VT323

## Project structure

```text
src/
├── components/   # Terminal UI, boot screen, side panels, and effects
├── data/         # Virtual filesystem data and rendering helpers
├── lib/          # Command registry and repository ZIP export
├── App.tsx       # Application composition and state
└── main.tsx      # Browser entry point
```

## License

Licensed under the [Apache License 2.0](LICENSE).
