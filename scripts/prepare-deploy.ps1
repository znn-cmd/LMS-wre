# PowerShell script to prepare project for deployment

Write-Host "🚀 Preparing WRE LMS for deployment..." -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check if remote exists
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/znn-cmd/LMS-wre.git
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Staging all changes..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Prepare for Vercel deployment - WRE LMS Platform"
}

Write-Host ""
Write-Host "✅ Project is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Push to GitHub: git push -u origin main"
Write-Host "2. Go to https://vercel.com and import your repository"
Write-Host "3. Add environment variables in Vercel dashboard"
Write-Host "4. Deploy!"
Write-Host ""
Write-Host "📖 See DEPLOY.md for detailed instructions" -ForegroundColor Yellow


