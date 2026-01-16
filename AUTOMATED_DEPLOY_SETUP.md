# 🤖 Automated Deployment Setup - GitHub Actions

## ✅ Kya Ho Gaya:

GitHub Actions workflow file create ho gayi hai jo **automatically deploy** karega jab bhi aap code push karoge!

---

## 🔐 Step 1: Hostinger FTP Credentials Nikalo

### Method 1: Hostinger Panel se

1. **Login:** https://hpanel.hostinger.com/
2. **Files** section mein jao
3. **FTP Accounts** click karo
4. Ye details note karo:
   ```
   FTP Server: ftp.yourdomain.com (or IP address)
   FTP Username: u123456789 (or your username)
   FTP Password: (create new or use existing)
   ```

### Method 2: File Manager se

1. Hostinger panel → **File Manager**
2. Top right corner → **FTP Details** button
3. Details copy karo

### Example FTP Details:
```
Server: ftp.legalsuccessindia.com
Username: u987654321
Password: YourSecurePassword123
```

---

## 🔑 Step 2: GitHub Secrets Add Karo

### 2.1 GitHub Repository Kholo
```
https://github.com/arsh077/legal-success-india-attandnce
```

### 2.2 Settings Mein Jao
- Repository page pe **Settings** tab click karo
- Left sidebar mein **Secrets and variables** expand karo
- **Actions** click karo

### 2.3 Secrets Add Karo

Click **"New repository secret"** aur ye 4 secrets add karo:

#### Secret 1: FTP_SERVER
```
Name: FTP_SERVER
Value: ftp.legalsuccessindia.com
(Ya jo bhi aapka FTP server hai)
```

#### Secret 2: FTP_USERNAME
```
Name: FTP_USERNAME
Value: u987654321
(Ya jo bhi aapka FTP username hai)
```

#### Secret 3: FTP_PASSWORD
```
Name: FTP_PASSWORD
Value: YourSecurePassword123
(Aapka FTP password)
```

#### Secret 4: VITE_PUSHER_APP_KEY
```
Name: VITE_PUSHER_APP_KEY
Value: 29d18e6ae1f9ed4b02ce
(Already hai - Pusher key)
```

---

## 📸 Screenshot Guide:

### Adding Secrets:

```
GitHub → Repository → Settings
    ↓
Secrets and variables → Actions
    ↓
New repository secret
    ↓
Name: FTP_SERVER
Value: ftp.legalsuccessindia.com
    ↓
Add secret
    ↓
Repeat for all 4 secrets
```

---

## ✅ Step 3: Workflow File Push Karo

Ye file already create ho gayi hai:
```
.github/workflows/deploy-hostinger.yml
```

Ab push karo:

```bash
git add .
git commit -m "Add automated deployment workflow"
git push origin main
```

---

## 🚀 Step 4: First Deployment Test

### 4.1 GitHub Actions Check Karo

1. GitHub repository kholo
2. **Actions** tab click karo
3. "Deploy to Hostinger" workflow dikhega
4. Latest run click karo
5. Progress dekho:
   ```
   🚚 Checkout code
   📦 Setup Node.js
   📥 Install dependencies
   🔨 Build project
   📤 Deploy to Hostinger via FTP
   ```

### 4.2 Success Check Karo

Green checkmark ✅ dikhna chahiye!

### 4.3 Site Test Karo

```
https://attendance.legalsuccessindia.com
```

Login karo aur check karo sab kaam kar raha hai!

---

## 🎯 How It Works:

### Automatic Deployment:

```
You: git push origin main
    ↓
GitHub Actions: Triggered automatically
    ↓
Step 1: Checkout code
Step 2: Install Node.js
Step 3: Install dependencies (npm ci)
Step 4: Build project (npm run build)
Step 5: Deploy to Hostinger via FTP
    ↓
Done! ✅ Site updated automatically
```

### Manual Deployment:

```
GitHub → Actions tab
    ↓
"Deploy to Hostinger" workflow
    ↓
"Run workflow" button
    ↓
Select branch: main
    ↓
Run workflow
    ↓
Done! ✅
```

---

## 🔄 Future Updates:

Ab jab bhi aap code change karoge:

```bash
# 1. Code change karo
# 2. Commit karo
git add .
git commit -m "Your changes"

# 3. Push karo
git push origin main

# 4. Automatic deploy! 🎉
# GitHub Actions automatically:
# - Build karega
# - Hostinger pe upload karega
# - 2-3 minutes mein live!
```

---

## 📊 Deployment Status:

### Check Deployment:

1. **GitHub Actions Tab:**
   - Green ✅ = Success
   - Red ❌ = Failed (check logs)
   - Yellow 🟡 = In Progress

2. **Email Notifications:**
   - GitHub automatically email bhejega
   - Success/Failure notifications

3. **Live Site:**
   - https://attendance.legalsuccessindia.com
   - Check if changes reflected

---

## 🐛 Troubleshooting:

### Problem: Workflow Failed

**Check Logs:**
```
GitHub → Actions → Failed workflow → Click on it
Read error messages
```

**Common Issues:**

1. **FTP Connection Failed**
   ```
   Error: Cannot connect to FTP server
   
   Solution:
   - Check FTP_SERVER secret (correct domain?)
   - Check FTP_USERNAME secret
   - Check FTP_PASSWORD secret
   - Verify FTP enabled in Hostinger
   ```

2. **Build Failed**
   ```
   Error: npm run build failed
   
   Solution:
   - Check if code has errors
   - Run locally: npm run build
   - Fix errors, then push again
   ```

3. **Permission Denied**
   ```
   Error: Permission denied
   
   Solution:
   - Check FTP user has write permissions
   - Check server-dir path: /public_html/attendance/
   ```

---

## 🔐 Security:

### Secrets are Safe:
- ✅ Encrypted by GitHub
- ✅ Not visible in logs
- ✅ Not accessible to others
- ✅ Only used during deployment

### FTP Password:
- ✅ Never shown in code
- ✅ Never shown in logs
- ✅ Stored securely in GitHub

---

## 📱 Manual Trigger:

Agar aap manually deploy karna chahte ho:

```
1. GitHub → Actions tab
2. "Deploy to Hostinger" workflow
3. "Run workflow" dropdown
4. "Run workflow" button
5. Wait 2-3 minutes
6. Done! ✅
```

---

## ✅ Setup Checklist:

- [ ] Hostinger FTP credentials nikale
- [ ] GitHub repository Settings khola
- [ ] Secrets and variables → Actions
- [ ] FTP_SERVER secret added
- [ ] FTP_USERNAME secret added
- [ ] FTP_PASSWORD secret added
- [ ] VITE_PUSHER_APP_KEY secret added
- [ ] Workflow file pushed to GitHub
- [ ] Actions tab checked
- [ ] First deployment successful
- [ ] Site tested and working

---

## 🎉 Benefits:

### Before (Manual):
```
1. npm run build (local)
2. Hostinger login
3. File Manager open
4. Old files delete
5. New files upload
6. Wait for upload
7. Test site
Total: 10-15 minutes
```

### After (Automated):
```
1. git push origin main
2. Wait 2-3 minutes
3. Done! ✅
Total: 2-3 minutes
```

---

## 📊 Deployment History:

GitHub Actions automatically maintains:
- ✅ Deployment history
- ✅ Build logs
- ✅ Success/Failure status
- ✅ Deployment time
- ✅ Who triggered it

---

## 🚀 Next Steps:

1. **Add FTP credentials to GitHub Secrets** (most important!)
2. **Push workflow file to GitHub**
3. **Check Actions tab**
4. **Wait for first deployment**
5. **Test site**
6. **Enjoy automated deployments!** 🎉

---

## 📞 Support:

### GitHub Actions:
- Docs: https://docs.github.com/en/actions
- Status: https://www.githubstatus.com/

### Hostinger FTP:
- Panel: https://hpanel.hostinger.com/
- Support: 24/7 live chat

---

## ✅ Summary:

**Setup Time:** 10 minutes (one-time)

**Future Deployments:** Automatic (2-3 minutes)

**Benefits:**
- ✅ No manual upload
- ✅ Automatic build
- ✅ Automatic deploy
- ✅ Version history
- ✅ Rollback possible
- ✅ Email notifications

---

**Ab FTP credentials add karo GitHub Secrets mein, phir push karo!** 🚀

**Future mein:** Just `git push` → Automatic deploy! ⚡
