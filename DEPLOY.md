# Deploy

## Live

| Item | URL |
|------|-----|
| **Production** | https://volleyball-design.vercel.app |
| **GitHub** | https://github.com/peeraponsatoshi/volleyball-design |
| **Vercel project** | https://vercel.com/thaiapp-market/volleyball-design |

## Auto-deploy (GitHub → Vercel)

Connected: `main` branch → Vercel Production.

Workflow:

1. Edit code locally  
2. Commit and push  

```bash
git add -A
git commit -m "your message"
git push origin main
```

3. Vercel builds automatically (`pnpm build` → `dist`)  
4. Site updates at https://volleyball-design.vercel.app  

Check deploy status: https://vercel.com/thaiapp-market/volleyball-design

## Manual deploy (optional)

```bash
npx vercel --prod --yes
```

## Local

```bash
pnpm install
pnpm dev
# or double-click run.bat
```

## Notes

- Free Vercel hosting (HTTPS + CDN)  
- SPA rewrites configured in `vercel.json`  
- Thai fonts load from Google Fonts (needs network)  
