# PowerShell Script: Run User Profiles Migration
# Description: Applies the user_profiles table migration to existing D1 database
# Author: Roger Lee Cormier
# Date: 2024

param(
    [string]$DatabaseName = "health_bridge",
    [string]$MigrationFile = "migrations/002_user_profiles.sql"
)

Write-Host "🚀 HealthBridge User Profiles Migration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if wrangler is available
try {
    $wranglerVersion = wrangler --version 2>&1
    Write-Host "✅ Wrangler found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler not found. Please install Wrangler CLI first." -ForegroundColor Red
    Write-Host "   npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check if migration file exists
if (-not (Test-Path $MigrationFile)) {
    Write-Host "❌ Migration file not found: $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Migration file: $MigrationFile" -ForegroundColor Yellow
Write-Host "🗄️  Database: $DatabaseName" -ForegroundColor Yellow
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "Do you want to proceed with the migration? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Running migration..." -ForegroundColor Yellow

try {
    # Run the migration using wrangler with the D1 config
    $result = wrangler d1 execute $DatabaseName --file $MigrationFile --config wrangler-d1.toml 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Tables created:" -ForegroundColor Cyan
        Write-Host "   - user_profiles" -ForegroundColor White
        Write-Host "   - weight_goals" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 To verify the migration, run:" -ForegroundColor Yellow
        Write-Host "   wrangler d1 execute $DatabaseName --command 'SELECT name FROM sqlite_master WHERE type=\"table\";'" -ForegroundColor Gray
    } else {
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error running migration: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Migration script completed!" -ForegroundColor Green
Write-Host "Your user profiles and weight goals are now stored in the database." -ForegroundColor White
