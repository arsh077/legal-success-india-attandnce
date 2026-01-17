@echo off
echo ========================================
echo  Legal Success India - Hostinger Deploy
echo ========================================
echo.

echo 🔧 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

echo 📦 Files ready in 'dist' folder:
dir dist /b
echo.

echo 🚀 DEPLOYMENT INSTRUCTIONS:
echo.
echo 1. Download FileZilla: https://filezilla-project.org/download.php?type=client
echo.
echo 2. Connect with these credentials:
echo    Host: 89.116.133.226
echo    Username: u136712005.attendance.legalsuccessindia.com
echo    Password: Legal@1997
echo    Port: 21
echo.
echo 3. Navigate to /public_html/ folder (right side)
echo.
echo 4. Delete any existing files in public_html
echo.
echo 5. Upload ALL files from 'dist' folder to public_html:
echo    - Select all files in 'dist' folder
echo    - Drag and drop to /public_html/
echo.
echo 6. Test website: https://attendance.legalsuccessindia.com
echo.
echo 7. Clear cache: https://attendance.legalsuccessindia.com/clear-cache-v3.html
echo.

echo 🧪 TEST CREDENTIALS:
echo    Admin: Info@legalsuccessindia.com / Legal@000
echo    Manager: vizralegalsuccess@gmail.com / Ahsan@110
echo    Employee: legalsuccessindia94@gmail.com / Legal@002
echo.

echo ✅ Ready to deploy! Follow the instructions above.
echo.
pause