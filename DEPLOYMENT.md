# 🚀 Deployment Guide

## GitHub Setup (Already Done ✅)

The repository has been initialized and configured. To push to GitHub:

```bash
git push -u origin main
```

If the repository already exists on GitHub, you may need to force push:
```bash
git push -u origin main --force
```

## 📝 Before Pushing

### 1. Add the Company Logo
Save your logo as `public/assets/logo.png`:
- Use the black/white version (second image provided)
- Recommended size: 200x200px
- Format: PNG with transparent or white background
- Shape: Circular crop

### 2. Verify Everything Works
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and test:
- Login with different roles
- Clock in/out functionality
- Dashboard analytics
- Leave requests
- Employee management (Admin only)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Push to GitHub (see above)
2. Visit [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. Deploy!

### Option 2: Netlify
1. Push to GitHub
2. Visit [netlify.com](https://netlify.com)
3. New site from Git
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy!

### Option 3: GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/legal-success-india-attendance/',
  // ... rest of config
})
```

Deploy:
```bash
npm run deploy
```

## 🔧 Environment Variables

If you need API keys or backend URLs, create `.env.local`:
```
VITE_API_URL=your_api_url
VITE_API_KEY=your_api_key
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📊 Post-Deployment Checklist

- [ ] Logo displays correctly
- [ ] All pages load without errors
- [ ] Login works for all roles
- [ ] Attendance tracking functions
- [ ] Charts render properly
- [ ] Mobile responsive
- [ ] Browser compatibility tested

## 🐛 Troubleshooting

### Logo not showing?
- Check file path: `public/assets/logo.png`
- Verify file format (PNG recommended)
- Clear browser cache

### Build fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routing issues on deployment?
Add `_redirects` file in `public/`:
```
/*    /index.html   200
```

## 📞 Support

For issues, contact the developer or create an issue on GitHub.

---

**Ready to deploy!** 🎉
