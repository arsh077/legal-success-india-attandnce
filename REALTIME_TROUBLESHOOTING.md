# 🔧 Real-Time Attendance Troubleshooting Guide

## Issues Fixed

### 1. ✅ "Present Today" Count Fixed
**Problem**: Kabir clocked in but Admin dashboard showed "Present Today: 0"

**Root Cause**: Code was only counting employees who are **currently clocked in** (not clocked out yet). Since Kabir clocked out at 12:30 PM, he wasn't counted.

**Fix**: Changed logic to count ALL employees who clocked in today, regardless of clock out status.

```typescript
// OLD (Wrong):
const presentToday = todayAttendance.filter(a => a.clockIn && !a.clockOut).length;

// NEW (Correct):
const presentToday = todayAttendance.filter(a => a.clockIn).length;
```

### 2. ⚠️ Real-Time Notifications Not Working
**Problem**: When Kabir clocked in, Admin didn't receive notification

**Root Cause**: Pusher client events might not be enabled OR environment variables not loaded

**Solutions**:

#### Solution A: Enable Client Events in Pusher Dashboard
1. Go to: https://dashboard.pusher.com/apps/2102508
2. Click on "App Settings"
3. Scroll to "Client Events"
4. **Enable "Client Events"** checkbox
5. Click "Update"

#### Solution B: Test Pusher Connection
Visit this page to test Pusher:
https://attendance.legalsuccessindia.com/pusher-test.html

You should see:
- ✅ Connected to Pusher
- ✅ Subscribed to attendance-channel
- Test buttons to send events

#### Solution C: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Look for Pusher logs:
   - `🔧 Initializing Pusher with: ...`
   - `✅ Pusher connected successfully`
   - `✅ Subscribed to attendance-channel`

If you see:
- `⚠️ Pusher credentials not found` → Environment variables missing
- `❌ Pusher connection error` → Check Pusher dashboard
- `❌ Failed to send event` → Client events not enabled

## How Real-Time Should Work

### Scenario 1: Employee Clocks In
```
1. Kabir (Mobile) clicks "Clock In" → 12:30 PM
2. Attendance saved to localStorage
3. Pusher event sent: "client-clock-in"
4. Admin (Desktop) receives event
5. Admin sees notification: "Kabir clocked in at 12:30 PM"
6. Dashboard updates: "Present Today: 1"
7. Live Attendance Tracker shows: "Kabir - Active Now"
```

### Scenario 2: Employee Requests Leave
```
1. Kabir submits leave request
2. Request saved to localStorage
3. Pusher event sent: "client-leave-request"
4. Admin receives notification: "Kabir requested Casual leave..."
5. Admin can approve/reject from Leaves page
```

### Scenario 3: Admin Approves Leave
```
1. Admin clicks "Approve" on leave request
2. Status updated to "APPROVED"
3. Pusher event sent: "client-leave-action"
4. Kabir receives notification: "Your leave request has been approved"
```

## Testing Steps

### Test 1: Check if Pusher is Connected
1. Login as Admin
2. Press F12 → Console tab
3. Look for: `✅ Pusher connected successfully`
4. If not connected, check Pusher dashboard

### Test 2: Test Pusher Events
1. Visit: https://attendance.legalsuccessindia.com/pusher-test.html
2. Wait for "✅ Connected"
3. Click "Test Clock In Event"
4. Check Event Log for "📤 Sent clock-in event"
5. Open another tab with same page
6. You should see "🟢 Received clock-in" in second tab

### Test 3: Test Real Attendance
1. Open Admin dashboard in one browser
2. Open Employee dashboard in another browser (or phone)
3. Employee clicks "Clock In"
4. Admin should see:
   - Notification bell shows "1"
   - "Present Today" increases
   - Live Attendance Tracker updates

### Test 4: Check Environment Variables
1. Visit: https://attendance.legalsuccessindia.com/version-check.html
2. Check if Pusher credentials are loaded
3. Or check browser console for Pusher initialization logs

## Common Issues & Solutions

### Issue 1: "Present Today" Shows 0
**Symptoms**: Employee clocked in but count is 0

**Solutions**:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Wait 5-10 minutes for deployment
4. Check if employee actually clocked in (check My Attendance page)

### Issue 2: No Notifications Appearing
**Symptoms**: Bell icon shows but no notifications

**Solutions**:
1. Check Pusher connection (F12 → Console)
2. Enable Client Events in Pusher dashboard
3. Verify environment variables are set
4. Test with pusher-test.html page

### Issue 3: Notifications Not Real-Time
**Symptoms**: Notifications appear after page refresh

**Solutions**:
1. Check Pusher connection status
2. Verify both devices are online
3. Check if Client Events are enabled
4. Test cross-device sync with pusher-test.html

### Issue 4: Clock In Button Not Working
**Symptoms**: Button doesn't respond or shows error

**Solutions**:
1. Check browser console for errors
2. Verify user is logged in as Employee (not Admin)
3. Check if already clocked in today
4. Clear localStorage and try again

## Pusher Configuration Checklist

### In Pusher Dashboard:
- [ ] App ID: 2102508
- [ ] App Key: 29d18e6ae1f9ed4b02ce
- [ ] Cluster: ap2 (Asia Pacific)
- [ ] **Client Events: ENABLED** ← Most Important!
- [ ] Channel: attendance-channel

### In Code:
- [ ] .env.production has VITE_PUSHER_APP_KEY
- [ ] .env.production has VITE_PUSHER_CLUSTER
- [ ] GitHub Secrets has VITE_PUSHER_APP_KEY
- [ ] Build includes environment variables

### In Browser:
- [ ] Console shows "✅ Pusher connected"
- [ ] Console shows "✅ Subscribed to attendance-channel"
- [ ] No Pusher errors in console
- [ ] Network tab shows WebSocket connection

## Debugging Commands

### Check Pusher Connection:
```javascript
// In browser console:
localStorage.getItem('ls_attendance')  // Check attendance data
localStorage.getItem('last_update')    // Check last update time
```

### Force Sync:
```javascript
// In browser console:
window.location.reload(true)  // Hard reload
localStorage.clear()          // Clear all data (will logout)
```

### Check Pusher Status:
```javascript
// In browser console (if Pusher is exposed):
pusher.connection.state  // Should be "connected"
```

## What to Check After Deployment

1. **Version Check**: https://attendance.legalsuccessindia.com/version-check.html
2. **Pusher Test**: https://attendance.legalsuccessindia.com/pusher-test.html
3. **Clear Cache**: https://attendance.legalsuccessindia.com/clear-cache-v2.html
4. **GitHub Actions**: https://github.com/arsh077/legal-success-india-attandnce/actions

## Expected Behavior

### Admin Dashboard:
- Shows total staff count (6)
- Shows present today count (updates in real-time)
- Shows late arrivals count
- Shows on leave count
- Live Attendance Tracker with employee status
- Notification bell with unread count

### Employee Dashboard:
- Shows leave balance
- Shows attended days this month
- Quick Attendance card with Clock In/Out button
- Shows current status (clocked in time)
- Notification bell for leave approvals

## Still Not Working?

### Step 1: Clear Everything
```
1. Ctrl + Shift + Delete
2. Clear "Cached images and files"
3. Clear "Cookies and other site data"
4. Select "All time"
5. Click "Clear data"
```

### Step 2: Test in Incognito
```
1. Ctrl + Shift + N (Chrome)
2. Go to attendance.legalsuccessindia.com
3. Login and test
```

### Step 3: Check Pusher Dashboard
```
1. Go to https://dashboard.pusher.com/apps/2102508
2. Click "Debug Console"
3. Watch for events when you clock in
4. Should see "client-clock-in" events
```

### Step 4: Manual FTP Upload
```
1. Connect to FTP: 89.116.133.226
2. Username: u136712005.attendance.legalsuccessindia.com
3. Password: Legal@1997
4. Delete all files in /public_html/attendance/
5. Upload all files from local dist/ folder
```

## Contact Support

If still not working, provide:
1. Screenshot of browser console (F12 → Console)
2. Screenshot of Network tab (F12 → Network → WS filter)
3. Screenshot of pusher-test.html page
4. Pusher dashboard Debug Console screenshot

---

**Last Updated**: January 16, 2026
**Version**: 7725277
**Status**: ✅ Fixes Deployed
