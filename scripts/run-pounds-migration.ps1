#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run the HealthBridge pounds conversion migration
    
.DESCRIPTION
    This script runs the migration to convert the HealthBridge database from kilograms to pounds.
    It updates the schema and migrates existing data.
    
.PARAMETER DatabaseName
    The name of the D1 database (default: health_bridge)
    
.PARAMETER MigrationFile
    The path to the migration file (default: migrations/006_convert_to_pounds.sql)
    
.PARAMETER ConfigFile
    The wrangler config file to use (default: wrangler-d1.toml)
    
.EXAMPLE
    .\scripts\run-pounds-migration.ps1
    
.EXAMPLE
    .\scripts\run-pounds-migration.ps1 -DatabaseName "my-health-db" -MigrationFile "migrations/custom_migration.sql"
#>

param(
    [string]$DatabaseName = "health_bridge",
    [string]$MigrationFile = "migrations/006_convert_to_pounds.sql",
    [string]$ConfigFile = "wrangler-d1.toml"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🏥 HealthBridge Pounds Conversion Migration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
try {
    $wranglerVersion = wrangler --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Wrangler not found"
    }
    Write-Host "✅ Wrangler CLI found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g wrangler" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run: wrangler login" -ForegroundColor Yellow
    exit 1
}

# Check if migration file exists
if (-not (Test-Path $MigrationFile)) {
    Write-Host "❌ Migration file not found: $MigrationFile" -ForegroundColor Red
    Write-Host "   Please check the file path and try again." -ForegroundColor Yellow
    exit 1
}

# Check if config file exists
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Wrangler config file not found: $ConfigFile" -ForegroundColor Red
    Write-Host "   Please check the file path and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Migration file: $MigrationFile" -ForegroundColor White
Write-Host "📁 Config file: $ConfigFile" -ForegroundColor White
Write-Host "🗄️  Database: $DatabaseName" -ForegroundColor White
Write-Host ""

# Confirm before proceeding
Write-Host "⚠️  WARNING: This migration will:" -ForegroundColor Yellow
Write-Host "   - Convert all weight data from kilograms to pounds" -ForegroundColor Yellow
Write-Host "   - Update database schema to use pounds" -ForegroundColor Yellow
Write-Host "   - Remove goal-setting functionality from HealthBridge app" -ForegroundColor Yellow
Write-Host "   - Move goal management to Settings page only" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Goals will still be accessible and editable in your Settings page." -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting migration..." -ForegroundColor Green

try {
    # Run the migration
    Write-Host "📝 Executing migration..." -ForegroundColor White
    $migrationResult = wrangler d1 execute $DatabaseName --file $MigrationFile --config $ConfigFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify the migration
        Write-Host "🔍 Verifying migration..." -ForegroundColor White
        $verifyResult = wrangler d1 execute $DatabaseName --command "SELECT name FROM sqlite_master WHERE type='table';" --config $ConfigFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database verification successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Current tables:" -ForegroundColor White
            $verifyResult | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "⚠️  Migration completed but verification failed:" -ForegroundColor Yellow
            Write-Host $verifyResult -ForegroundColor Red
        }
        
        # Check weight measurements
        Write-Host ""
        Write-Host "🔍 Checking weight measurements..." -ForegroundColor White
        $weightCheck = wrangler d1 execute $DatabaseName --command "SELECT COUNT(*) as count, MIN(weight_lbs) as min_lbs, MAX(weight_lbs) as max_lbs FROM weight_measurements;" --config $ConfigFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Weight data verification successful!" -ForegroundColor Green
            Write-Host $weightCheck -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Weight data verification failed:" -ForegroundColor Yellow
            Write-Host $weightCheck -ForegroundColor Red
        }
        
        # Check weight goals
        Write-Host ""
        Write-Host "🔍 Checking weight goals..." -ForegroundColor White
        $goalCheck = wrangler d1 execute $DatabaseName --command "SELECT COUNT(*) as count, MIN(target_weight_lbs) as min_target, MAX(target_weight_lbs) as max_target FROM weight_goals;" --config $ConfigFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Weight goals verification successful!" -ForegroundColor Green
            Write-Host $goalCheck -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Weight goals verification failed:" -ForegroundColor Yellow
            Write-Host $goalCheck -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $migrationResult -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Migration failed with exception:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Migration Summary:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ Database schema updated to use pounds" -ForegroundColor Green
Write-Host "✅ Existing data converted from kg to lbs" -ForegroundColor Green
Write-Host "✅ Goal management moved to Settings page" -ForegroundColor Green
Write-Host "✅ HealthBridge app now only allows weight entry" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update your HealthBridge app to use the new API" -ForegroundColor White
Write-Host "   2. Test weight entry functionality" -ForegroundColor White
Write-Host "   3. Verify goals are working in Settings page" -ForegroundColor White
Write-Host "   4. Deploy the updated worker and frontend" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Settings page: /settings" -ForegroundColor Cyan
Write-Host "🔗 HealthBridge app: /healthbridge-enhanced" -ForegroundColor Cyan
Write-Host ""
Write-Host "Migration completed successfully! 🚀" -ForegroundColor Green
