# Legal Success India - Hostinger Deployment Script
# Run this script to prepare and get deployment instructions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Legal Success India - Hostinger Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Files ready in 'dist' folder:" -ForegroundColor Blue
Get-ChildItem -Path "dist" -Name
Write-Host ""

Write-Host "🚀 DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Download FileZilla:" -ForegroundColor White
Write-Host "   https://filezilla-project.org/download.php?type=client" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Connect with these credentials:" -ForegroundColor White
Write-Host "   Host: 89.116.133.226" -ForegroundColor Gray
Write-Host "   Username: u136712005.attendance.legalsuccessindia.com" -ForegroundColor Gray
Write-Host "   Password: Legal@1997" -ForegroundColor Gray
Write-Host "   Port: 21" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Navigate to /public_html/ folder (right side)" -ForegroundColor White
Write-Host ""
Write-Host "4. Delete any existing files in public_html" -ForegroundColor White
Write-Host ""
Write-Host "5. Upload ALL files from 'dist' folder to public_html:" -ForegroundColor White
Write-Host "   - Select all files in 'dist' folder" -ForegroundColor Gray
Write-Host "   - Drag and drop to /public_html/" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Test website: https://attendance.legalsuccessindia.com" -ForegroundColor White
Write-Host ""
Write-Host "7. Clear cache: https://attendance.legalsuccessindia.com/clear-cache-v3.html" -ForegroundColor White
Write-Host ""

Write-Host "🧪 TEST CREDENTIALS:" -ForegroundColor Green
Write-Host "   Admin: Info@legalsuccessindia.com / Legal@000" -ForegroundColor Gray
Write-Host "   Manager: vizralegalsuccess@gmail.com / Ahsan@110" -ForegroundColor Gray
Write-Host "   Employee: legalsuccessindia94@gmail.com / Legal@002" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Ready to deploy! Follow the instructions above." -ForegroundColor Green
Write-Host ""

# Try to open FileZilla download page
try {
    Start-Process "https://filezilla-project.org/download.php?type=client"
    Write-Host "🌐 Opening FileZilla download page..." -ForegroundColor Blue
} catch {
    Write-Host "💡 Manually visit: https://filezilla-project.org/download.php?type=client" -ForegroundColor Yellow
}

Read-Host "Press Enter to continue"