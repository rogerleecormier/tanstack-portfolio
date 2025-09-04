# PowerShell script to run the user authentication mapping migration
# This script applies the new user mapping table to the D1 database

Write-Host "Running user authentication mapping migration..." -ForegroundColor Green

# Check if wrangler is available
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "Error: wrangler CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Run the migration
Write-Host "Applying migration 007_user_authentication_mapping.sql..." -ForegroundColor Yellow

try {
    wrangler d1 execute health_bridge --file="migrations/007_user_authentication_mapping.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The following mappings have been created:" -ForegroundColor Cyan
        Write-Host "- rogerleecormier@gmail.com (Cloudflare Access) -> user ID '1'" -ForegroundColor White
        Write-Host "- dev-user-123 (Development) -> dev-user-123" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now add new users by inserting records into the user_authentication_mapping table." -ForegroundColor Cyan
    } else {
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error running migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the updated worker with: wrangler deploy" -ForegroundColor White
Write-Host "2. Test the settings page to ensure user data loads correctly" -ForegroundColor White
Write-Host "3. Add new users by inserting into user_authentication_mapping table" -ForegroundColor White
