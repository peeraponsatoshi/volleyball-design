# Deploy (Free 24/7)

This project is a **Vue 3 + Vite** SPA (based on [yft-design](https://github.com/dromara/yft-design)).  
Editor runs in the browser — export PNG/SVG/PDF on the client. No paid server required for MVP.

## Stack choice

| Item | Choice | Why |
|------|--------|-----|
| Framework | **Vue 3** | yft-design is Vue; no React rewrite needed |
| Free host | **Vercel** (recommended) or Netlify / Cloudflare Pages | Static CDN, HTTPS, online 24/7 free tier |

## Local development

```bash
# Node 18+ recommended (Volta: 18.19.0)
pnpm install
pnpm approve-builds   # allow esbuild / core-js scripts if pnpm asks
pnpm dev              # http://localhost:5174
pnpm build            # output: dist/
```

## Free deploy — Vercel (recommended)

1. Push this repo to GitHub (your account).
2. Go to [https://vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Settings (auto-detected if `vercel.json` is present):
   - **Framework:** Vite  
   - **Build Command:** `pnpm build`  
   - **Output Directory:** `dist`  
   - **Install Command:** `pnpm install`
4. Deploy → get a URL like `https://your-app.vercel.app` (online 24/7 on free tier).

CLI alternative:

```bash
npm i -g vercel
vercel
```

## Free deploy — Netlify

1. [https://app.netlify.com](https://app.netlify.com) → Add new site → Import from Git.
2. Build command: `pnpm build` · Publish directory: `dist`
3. Or drag-and-drop the `dist` folder after `pnpm build`.

`netlify.toml` is already configured for SPA routing.

## Free deploy — Cloudflare Pages

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages.
2. Connect GitHub repo.
3. Build command: `pnpm build` · Output: `dist` · Node: 18.

## What works offline / free (no backend)

- Open editor, add text/images/shapes  
- Undo/redo, export image/SVG/PDF  
- Local project data (browser storage / IndexedDB)  

## What needs a backend later (optional, not free-static)

- Multi-user login / cloud save  
- Shared team template library on server  
- Upload assets to cloud storage  
- Auto-fill match scores from an API  

For MVP volleyball Facebook content, **client-only + free static host is enough**.

## Volleyball content workflow (suggested)

1. Create templates: match result, schedule, roster, news headline  
2. Set canvas sizes: `1080×1080`, `1200×630`, Story `1080×1920`  
3. Add Thai fonts under `src/assets/fonts/` and register in `src/configs/fonts.ts`  
4. Export PNG → post to Facebook  

## License

Upstream: MIT (dromara/yft-design). Keep LICENSE when redistributing.
