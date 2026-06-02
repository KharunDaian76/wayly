# PWA & app icons

This folder holds the installable-app icon set referenced by `src/app/manifest.ts`
and the root layout metadata. Binary assets are produced in the design milestone;
this file documents the required set so the manifest contract is stable now.

## Required assets

| File                   | Size     | Purpose                              |
| ---------------------- | -------- | ------------------------------------ |
| `icon-192.png`         | 192×192  | Standard PWA icon / favicon fallback |
| `icon-512.png`         | 512×512  | Standard PWA icon (splash, stores)   |
| `maskable-192.png`     | 192×192  | Android maskable (safe-zone padded)  |
| `maskable-512.png`     | 512×512  | Android maskable (safe-zone padded)  |
| `apple-touch-icon.png` | 180×180  | iOS home-screen icon                 |
| `favicon.ico`          | 16/32/48 | Legacy browser favicon               |

## Guidelines

- Brand mark on the violet primary (`#7c5cff`) background for maskable variants.
- Keep the logo within the central 80% safe zone for maskable icons.
- Export from a single source SVG to keep all sizes crisp.
