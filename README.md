# Signal Jam

<p align="center">
  <a href="https://gxella.github.io/Signal-Jam/">
    <img src="https://img.shields.io/badge/%E2%96%B6%20PLAY-SIGNAL%20JAM-75dcf4?style=for-the-badge&labelColor=101c29" alt="Play Signal Jam">
  </a>
</p>

Signal Jam is an offline-friendly Minesweeper game built with plain HTML, CSS, and JavaScript. Play classic or custom boards, work through a 100-level Career, earn coins, unlock cosmetics, and learn the controls with a guided tutorial. No account, dependencies, or game server required.

## Features

- **Classic and custom games:** Easy, Normal, Hard, or custom boards up to 100 rows by 1,000 columns.
- **100-level Career:** Play 100 progressively harder, seeded challenges. Every tenth level is a special blackout board.
- **Local progress:** Best times, scores, career progress, coins, cosmetics, and settings save in your browser. Settings include High/Low visual quality and sound on/off.
- **Cosmetics:** Unlock themes, boards, mines, and flags with coins earned in Career.
- **Selected collectible artwork:** 17 premium mines and 10 premium flags with
  transparent 256px PNG masters, optimized WebP game assets and colored rarity
  tiers. Classic defaults stay free. Prices range from 300 to 2,400 coins.
- **Responsive controls:** Mouse, keyboard, and touch support.
- **Offline play:** Once loaded, game data stays in your browser; no network service is needed.

Each game tracks elapsed time and a score based on mines and time. Best score and best time are recorded independently for each Normal difficulty, custom board, and Career level. Career wins award coins.

## Controls

| Input | Action |
| --- | --- |
| Left-click / tap | Reveal a cell |
| Right-click | Flag a cell |
| Hold a cell on a touchscreen | Flag or unflag without revealing |
| Arrow keys | Move between cells |
| Enter | Reveal selected cell |
| F or Space | Flag selected cell |
| P | Pause or resume |
| R | Restart |
| H | Open the field guide |

The first reveal on each board is safe.
Dragging inside Active Grid pans boards that overflow. Boards that fit keep the
page still, including blackout levels. Scroll outside the grid to move the page.

## Run locally

Open `index.html` in a browser, or serve the folder with Python:

```sh
python -m http.server 4173
```

Then open <http://localhost:4173/>. No build step or package installation is required.

## Checks

With Node.js installed, run:

```sh
node tests.js
```

For browser regression checks, use an existing Playwright installation and Chrome:

```sh
node checks/mobile.cjs
```

These checks cover seven phone/tablet/desktop sizes, long-press flags, cancelled
gestures, internal grid dragging and edges, blackout level 10, rotation, win/loss
panels, pause/resume, custom-board virtualization, menus, shop previews and tutorial.
They use Chromium touch emulation; physical iPhone/Safari behavior still needs a
device check. Playwright is a development test tool, not a game dependency.

## Saved data

Progress is stored in the browser's `localStorage`. Clearing site data for Signal Jam also clears the local save.

## Hosting

GitHub Pages deploys the static game from the `main` branch through the workflow in `.github/workflows/pages.yml`. The Play button above opens the live game.
