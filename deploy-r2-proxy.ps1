Write-Host "Deploying R2 Content Proxy Worker..." -ForegroundColor Green
Write-Host ""

Write-Host "Building worker..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "Deploying to Cloudflare..." -ForegroundColor Yellow
wrangler deploy --config wrangler-r2-proxy.toml --env production

Write-Host ""
Write-Host "Worker deployment complete!" -ForegroundColor Green
Write-Host "Your content should now be accessible with proper CORS headers." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
