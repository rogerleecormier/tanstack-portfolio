Write-Host "Configuring CORS on R2 bucket..." -ForegroundColor Green
Write-Host ""

Write-Host "Applying CORS configuration to portfolio-content bucket..." -ForegroundColor Yellow
wrangler r2 bucket cors set portfolio-content --config wrangler-r2.toml --file r2-cors.json

Write-Host ""
Write-Host "CORS configuration complete!" -ForegroundColor Green
Write-Host "Your R2 bucket should now allow requests from rcormier.dev" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
