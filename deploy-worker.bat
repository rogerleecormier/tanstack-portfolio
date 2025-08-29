@echo off
REM GitHub File Manager Worker Deployment Script for Windows
REM Run this from the root directory

echo 🚀 Deploying GitHub File Manager Worker...

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Wrangler CLI not found. Please install it first:
    echo npm install -g wrangler
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "wrangler-file-manager.toml" (
    echo ❌ wrangler-file-manager.toml not found. Please run this script from the root directory.
    pause
    exit /b 1
)

REM Check if worker source exists
if not exist "workers\github-file-manager.ts" (
    echo ❌ workers\github-file-manager.ts not found. Worker source file is missing.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Type check the worker
echo 🔍 Running worker type check...
call npm run worker:type-check
if %errorlevel% neq 0 (
    echo ❌ Worker type check failed
    pause
    exit /b 1
)

REM Deploy based on environment
if "%1"=="production" (
    echo 🚀 Deploying to production...
    call npm run worker:deploy:prod
) else (
    echo 🚀 Deploying to production (default)...
    call npm run worker:deploy:prod
)

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Your GITHUB_TOKEN is already configured in Cloudflare Secrets Store
echo 2. Update the worker URL in your frontend code
echo 3. Test the file saving functionality
echo.
echo 🔗 Worker URL:
echo Production:  https://github-file-manager-prod.your-subdomain.workers.dev
echo.
pause
