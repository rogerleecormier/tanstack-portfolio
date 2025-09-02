@echo off
REM Batch Script: Run User Profiles Migration
REM Description: Applies the user_profiles table migration to existing D1 database
REM Author: Roger Lee Cormier
REM Date: 2024

setlocal enabledelayedexpansion

echo 🚀 HealthBridge User Profiles Migration
echo =========================================

REM Check if wrangler is available
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Wrangler not found. Please install Wrangler CLI first.
    echo    npm install -g wrangler
    pause
    exit /b 1
)

echo ✅ Wrangler found
echo 📁 Migration file: migrations\002_user_profiles.sql
echo 🗄️  Database: health_bridge
echo.

REM Confirm before proceeding
set /p confirm="Do you want to proceed with the migration? (y/N): "
if /i not "%confirm%"=="y" (
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo 🔄 Running migration...

REM Run the migration using wrangler with the D1 config
wrangler d1 execute health_bridge --file migrations\002_user_profiles.sql --config wrangler-d1.toml

if %errorlevel% equ 0 (
    echo ✅ Migration completed successfully!
    echo.
    echo 📊 Tables created:
    echo    - user_profiles
    echo    - weight_goals
    echo.
    echo 🔍 To verify the migration, run:
echo    wrangler d1 execute health_bridge --command "SELECT name FROM sqlite_master WHERE type='table';"
) else (
    echo ❌ Migration failed!
    echo Please check the error output above.
)

echo.
echo 🎉 Migration script completed!
echo Your user profiles and weight goals are now stored in the database.
pause
