# PowerShell script to set up custom domain for R2 bucket
Write-Host "Setting up custom domain for R2 bucket..." -ForegroundColor Green

Write-Host "`nStep 1: Create R2 custom domain" -ForegroundColor Yellow
Write-Host "Run this command in your terminal:" -ForegroundColor White
Write-Host "npx wrangler r2 bucket domain create tanstack-portfolio-r2 --domain portfolio-content.rcormier.com" -ForegroundColor Cyan

Write-Host "`nStep 2: Update your DNS" -ForegroundColor Yellow
Write-Host "Add this CNAME record in your Cloudflare DNS:" -ForegroundColor White
Write-Host "Type: CNAME" -ForegroundColor Cyan
Write-Host "Name: portfolio-content" -ForegroundColor Cyan
Write-Host "Target: tanstack-portfolio-r2.rcormier.r2.cloudflarestorage.com" -ForegroundColor Cyan
Write-Host "Proxy status: Proxied (orange cloud)" -ForegroundColor Cyan

Write-Host "`nStep 3: Update R2 config" -ForegroundColor Yellow
Write-Host "After DNS propagates, update src/config/r2Config.ts with:" -ForegroundColor White
Write-Host "BASE_URL: 'https://portfolio-content.rcormier.com'" -ForegroundColor Cyan

Write-Host "`nStep 4: Test the domain" -ForegroundColor Yellow
Write-Host "Test with: curl https://portfolio-content.rcormier.com/portfolio/strategy.md" -ForegroundColor White

Read-Host "`nPress Enter to continue"
