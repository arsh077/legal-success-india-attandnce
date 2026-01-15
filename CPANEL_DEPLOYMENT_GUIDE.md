# 🚀 cPanel Deployment Guide

## ✅ Subdomain Created
**URL**: `https://attendance.legalsuccessindia.com`  
**Directory**: `/public_html/attendance/`

---

## 📦 Method 1: Manual Upload (Easiest - Do This First)

### Step 1: Build Your Project Locally

Open terminal in your project folder:

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build
```

This creates a `dist` folder with all production files.

### Step 2: Upload Files to cPanel

1. **Open cPanel File Manager**
   - Login to cPanel
   - Click "File Manager"

2. **Navigate to Attendance Folder**
   - Go to: `/public_html/attendance/`

3. **Upload Build Files**
   - Open the `dist` folder on your computer
   - Select ALL files inside `dist`:
     - `index.html`
     - `assets` folder
     - All other files
   - Upload to `/public_html/attendance/`

4. **Extract (if zipped)**
   - If you uploaded a zip, extract it
   - Make sure files are directly in `/attendance/` folder
   - NOT in `/attendance/dist/`

### Step 3: Test Your Site

Visit: **https://attendance.legalsuccessindia.com**

Should show your attendance portal!

---

## 🔄 Method 2: FTP Upload

### Using FileZilla or Any FTP Client:

**FTP Details** (Get from cPanel):
- Host: `ftp.legalsuccessindia.com`
- Username: Your cPanel username
- Password: Your cPanel password
- Port: 21

**Upload Location**: `/public_html/attendance/`

**Files to Upload**: Everything from `dist` folder

---

## 🤖 Method 3: GitHub Actions (Automatic)

### Setup GitHub Secrets:

1. **Go to GitHub Repository**
   - https://github.com/arsh077/legal-success-india-attandnce

2. **Settings → Secrets and Variables → Actions**

3. **Add New Repository Secrets**:

   **Secret 1: FTP_SERVER**
   ```
   ftp.legalsuccessindia.com
   ```

   **Secret 2: FTP_USERNAME**
   ```
   your_cpanel_username
   ```

   **Secret 3: FTP_PASSWORD**
   ```
   your_cpanel_password
   ```

4. **Push to GitHub**
   - Any push to `main` branch will auto-deploy!

---

## 📁 Correct File Structure

Your `/public_html/attendance/` should look like:

```
/public_html/attendance/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── logo.png
└── favicon.png
```

**NOT like this:**
```
/public_html/attendance/
└── dist/
    ├── index.html
    └── assets/
```

---

## 🔧 Important: Update Base Path

Before building, update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // For subdomain, use '/'
});
```

Then rebuild:
```bash
npm run build
```

---

## ✅ Quick Checklist

- [ ] Subdomain created: `attendance.legalsuccessindia.com`
- [ ] Folder created: `/public_html/attendance/`
- [ ] Project built locally: `npm run build`
- [ ] Files uploaded to correct location
- [ ] `index.html` is in `/attendance/` (not `/attendance/dist/`)
- [ ] Site tested: https://attendance.legalsuccessindia.com
- [ ] Login working with authorized emails

---

## 🧪 Test After Upload

1. **Visit**: https://attendance.legalsuccessindia.com
2. **Should see**: Login page with logo
3. **Test login**:
   - Admin: `Info@legalsuccessindia.om` / `Legal@000`
   - Manager: `vizralegalsuccess@gmail.com` / `Legal@004`
   - Employee: `lsikabir27@gmail.com` / `Legal@001`

---

## 🚨 Troubleshooting

### Issue: Blank Page
**Solution**: Check if files are in correct location
- Files should be in `/attendance/` not `/attendance/dist/`

### Issue: 404 Error
**Solution**: Make sure `index.html` exists in `/attendance/`

### Issue: Assets Not Loading
**Solution**: Check `base` path in `vite.config.ts` is set to `/`

### Issue: Login Not Working
**Solution**: Clear browser cache and try again

---

## 📝 Quick Steps Summary

1. **Build**: `npm run build`
2. **Upload**: All files from `dist` to `/public_html/attendance/`
3. **Test**: Visit `https://attendance.legalsuccessindia.com`
4. **Done**: Your site is live!

---

## 🔄 Update Process

When you make changes:

1. Make changes in code
2. Run `npm run build`
3. Upload new files to `/public_html/attendance/`
4. Clear browser cache
5. Test

Or use GitHub Actions for automatic deployment!

---

**Your attendance portal will be live at:**
**https://attendance.legalsuccessindia.com** 🚀

*Last Updated: January 15, 2026*
