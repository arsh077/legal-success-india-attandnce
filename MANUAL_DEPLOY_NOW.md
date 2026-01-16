# 🚀 Manual Deployment Guide - URGENT FIX

## Problem
The notification bell is not showing on your live website because the old version is cached or GitHub Actions hasn't deployed yet.

## Solution 1: Wait for GitHub Actions (5-10 minutes)
GitHub Actions will automatically deploy the latest version. Check status here:
https://github.com/arsh077/legal-success-india-attandnce/actions

## Solution 2: Manual FTP Upload (FASTEST - 2 minutes)

### Step 1: Build the Project Locally
The build is already done! The `dist` folder contains the latest version.

### Step 2: Upload via FTP
1. Open FileZilla or any FTP client
2. Connect to:
   - **Host**: `89.116.133.226`
   - **Username**: `u136712005.attendance.legalsuccessindia.com`
   - **Password**: `Legal@1997`
   - **Port**: `21`

3. Navigate to: `/public_html/attendance/`

4. **DELETE** all files in `/public_html/attendance/` first

5. Upload ALL files from your local `dist` folder to `/public_html/attendance/`

### Step 3: Clear Browser Cache
After upload, visit:
https://attendance.legalsuccessindia.com/clear-cache-v2.html

Click "Clear Cache & Reload"

## Solution 3: Clear Browser Cache Only (Try First!)

### On Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"
5. Go to: https://attendance.legalsuccessindia.com
6. Press `Ctrl + F5` (hard refresh)

### On Mobile:
1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data
5. Reopen the website

## Verification Checklist

After deployment, you should see:
- [ ] 🔔 Bell icon in the header (top-right, next to your profile)
- [ ] Red badge with number on bell icon (if you have notifications)
- [ ] Click bell → dropdown with notifications appears
- [ ] Employee dashboard has "Clock In" button (large, prominent)
- [ ] Admin sees "Quick Attendance" section on dashboard

## What's New in This Version

### 1. Notification Bell (Header)
```
[Logo] Dashboard                    🔔(3) [Admin - Info] [Ad]
                                     ↑
                              Notification Bell
```

### 2. Admin Notifications
- Clock in alerts: "Kabir Sharma clocked in at 10:45 AM (Late)"
- Clock out alerts: "Kabir Sharma clocked out at 6:30 PM (Duration: 7h 45m)"
- Leave requests: "Kabir Sharma requested Casual leave..."

### 3. Employee Dashboard
```
┌─────────────────────────────────────────┐
│  Quick Attendance                       │
│  You clocked in at 09:30 AM             │
│                          [Clock Out] ←  │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Bell Icon Still Not Showing?
1. Check browser console (F12) for errors
2. Verify you're logged in as Admin
3. Clear cache using Ctrl + Shift + Delete
4. Try incognito/private mode
5. Check if files uploaded correctly via FTP

### Clock In Button Not Working?
1. Make sure you're logged in as Employee (not Admin)
2. Check browser console for errors
3. Verify Pusher credentials in .env.production

### Notifications Not Appearing?
1. Check Pusher dashboard: https://dashboard.pusher.com/apps/2102508
2. Verify "Client Events" are enabled
3. Check browser console for Pusher connection status
4. Try logging out and logging back in

## Quick Test

### Test as Admin:
1. Login as: `Info@legalsuccessindia.com` / `Legal@000`
2. Look for bell icon in header (top-right)
3. Open another browser/device
4. Login as employee and clock in
5. Admin should see notification immediately

### Test as Employee:
1. Login as: `kabir@legalsuccessindia.com` / `Legal@001`
2. See "Quick Attendance" card on dashboard
3. Click "Clock In" button
4. Button should change to "Clock Out"
5. Admin (on another device) should see notification

## Files to Check After Upload

Make sure these files exist on server:
```
/public_html/attendance/
├── index.html (should be ~1.13 KB)
├── assets/
│   └── index-BrNMwk2s.js (should be ~625 KB)
├── favicon.png
└── clear-cache-v2.html
```

## Contact Support

If still not working after trying all solutions:
1. Take screenshot of browser console (F12 → Console tab)
2. Take screenshot of Network tab (F12 → Network tab)
3. Share the error messages

---

**Current Version**: 38a8d0d
**Last Updated**: January 16, 2026, 12:20 AM
**Status**: ✅ Code is ready, waiting for deployment
