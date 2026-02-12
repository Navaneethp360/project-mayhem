# Project Mayhem

> *"It's only after we've lost everything that we're free to do anything."*

Your ruthless alter ego accountability app. Set your rules. Get confronted. No escape.

## What is this?

Project Mayhem is a PWA (Progressive Web App) that works as a native app on **every platform**:
- **iPhone / iPad** — Add to Home Screen from Safari
- **Android** — Install prompt appears automatically in Chrome
- **Windows** — Install from Chrome/Edge address bar
- **Mac** — Install from Chrome/Edge address bar

## Features

- **AMOLED dark theme** with neon cyan/magenta accents
- **Add rules** — define how you want to live your life
- **Alter ego notifications** — ruthless, confrontational reminders throughout the day
- **Customizable schedule** — set frequency, wake/bed time
- **Offline support** — works without internet after first load
- **Zero backend** — all data stays on your device (LocalStorage)

## Deploy to GitHub Pages (Free)

### Quick Setup

1. Create a new repo on [github.com/new](https://github.com/new)
2. Run these commands:

```bash
cd WebApp
git init
git add .
git commit -m "first rule: you do not talk about project mayhem"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/project-mayhem.git
git push -u origin main
```

3. Go to your repo → **Settings** → **Pages**
4. Source: **GitHub Actions**
5. The workflow auto-deploys on push. Your app will be live at:
   `https://YOUR_USERNAME.github.io/project-mayhem/`

### Alternative: Vercel (even easier)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Click Deploy — done. Get a `.vercel.app` URL instantly.

### Alternative: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the `WebApp` folder
3. Done. Get a `.netlify.app` URL.

## Install as App

Once deployed, visit your URL on any device:

| Platform | How to Install |
|----------|---------------|
| **Android** | Chrome will show "Install" banner automatically, or tap ⋮ → "Install app" |
| **iPhone** | Safari → Share button → "Add to Home Screen" |
| **Windows** | Chrome/Edge → click install icon in address bar |
| **Mac** | Chrome/Edge → click install icon in address bar |

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks, no build step)
- Service Worker for offline & caching
- Web Notifications API for push alerts
- LocalStorage for persistence
- PWA manifest for native app experience

## License

Do what you want. The first rule is: you do not ask about the license.
