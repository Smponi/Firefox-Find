# Firefox Find

A Firefox extension that replaces the native Ctrl+F find bar with one that **automatically re-runs the search when new content loads** — infinite scroll, pagination, dynamic content.

![Demo](demo.gif)

## The Problem

Firefox's built-in Ctrl+F doesn't pick up content that loads after the initial page render. On infinite-scroll sites (Twitter/X, Reddit, news feeds), newly loaded posts are invisible to the native find bar.

## How It Works

- Intercepts `Ctrl+F` / `Cmd+F` and shows a custom find bar
- Highlights all matches using DOM manipulation (TreeWalker + mark elements)
- A `MutationObserver` watches for DOM changes and automatically re-runs the current search when new content appears
- Debounced at 200ms to avoid thrashing on rapid updates

## Features

- Auto-reruns search on DOM changes (infinite scroll, lazy loading, SPAs)
- Prev / Next navigation (also `Enter` / `Shift+Enter`)
- Match counter (current / total)
- `Esc` to close
- No background script, no permissions, no external dependencies

## Installation

### From Firefox Add-ons (AMO)

> Coming soon

### Manual (Developer)

1. Clone this repo
2. Open Firefox → `about:debugging` → **This Firefox**
3. Click **Load Temporary Add-on…**
4. Select `manifest.json`

The extension stays active until you restart Firefox. For a permanent install, load it as a signed extension via AMO or use Firefox Developer/Nightly with `xpinstall.signatures.required` set to `false`.

## Usage

| Key | Action |
|---|---|
| `Ctrl+F` / `Cmd+F` | Open find bar |
| `Enter` | Next match |
| `Shift+Enter` | Previous match |
| `↑` / `↓` buttons | Navigate matches |
| `Esc` | Close find bar |

## Files

```
manifest.json   Extension manifest (Manifest V2)
content.js      All logic: find bar, search, MutationObserver
content.css     Find bar styling
```

## License

MIT
