@echo off
REM Deploy All Cloudflare Workers Script for Windows
REM Run this from the root directory to deploy all workers

echo 🚀 Starting deployment of all Cloudflare Workers...
echo.

echo.
echo ========================================
echo 🚀 DEPLOYING ALL WORKERS TO CLOUDFLARE
echo ========================================
echo.

REM Track deployment results
set /a success_count=0
set /a total_count=5

REM 1. Deploy Content Search Worker
echo 📡 [1/5] Deploying Content Search Worker...
call wrangler deploy --config wrangler-content-search.toml
if %errorlevel% equ 0 (
    echo ✅ Content Search Worker deployed successfully
    set /a success_count+=1
) else (
    echo ❌ Content Search Worker deployment failed
)
echo.

REM 2. Deploy GitHub File Manager Worker
echo 📡 [2/5] Deploying GitHub File Manager Worker...
call wrangler deploy --config wrangler-file-manager.toml
if %errorlevel% equ 0 (
    echo ✅ GitHub File Manager Worker deployed successfully
    set /a success_count+=1
) else (
    echo ❌ GitHub File Manager Worker deployment failed
)
echo.

REM 3. Deploy AI Contact Analyzer Worker
echo 📡 [3/5] Deploying AI Contact Analyzer Worker...
call wrangler deploy --config wrangler-contact-ai.toml
if %errorlevel% equ 0 (
    echo ✅ AI Contact Analyzer Worker deployed successfully
    set /a success_count+=1
) else (
    echo ❌ AI Contact Analyzer Worker deployment failed
)
echo.

REM 4. Deploy Email Worker
echo 📡 [4/5] Deploying Email Worker...
call wrangler deploy --config wrangler-email.toml
if %errorlevel% equ 0 (
    echo ✅ Email Worker deployed successfully
    set /a success_count+=1
) else (
    echo ❌ Email Worker deployment failed
)
echo.

REM 5. Deploy Blog Subscription Worker
echo 📡 [5/5] Deploying Blog Subscription Worker...
call wrangler deploy --config wrangler-blog-subscription.toml
if %errorlevel% equ 0 (
    echo ✅ Blog Subscription Worker deployed successfully
    set /a success_count+=1
) else (
    echo ❌ Blog Subscription Worker deployment failed
)
echo.

REM Display deployment summary
echo ========================================
echo 📊 DEPLOYMENT SUMMARY
echo ========================================
echo.
echo ✅ Successfully deployed: %success_count%/%total_count% workers
echo.

if %success_count% equ %total_count% (
    echo 🎉 All workers deployed successfully!
    echo.
    echo 📋 Worker URLs:
    echo • Content Search: https://content-search.your-subdomain.workers.dev
    echo • GitHub File Manager: https://github-file-manager.your-subdomain.workers.dev
    echo • AI Contact Analyzer: https://tanstack-portfolio-ai-contact-analyzer.your-subdomain.workers.dev
    echo • Email Worker: https://tanstack-portfolio-email-worker.your-subdomain.workers.dev
    echo • Blog Subscription: https://tanstack-portfolio-blog-subscription.your-subdomain.workers.dev
    echo.
    echo 🔧 Next steps:
    echo 1. Verify all workers are running correctly
    echo 2. Test the functionality of each worker
    echo 3. Update any frontend URLs if needed
    echo 4. Monitor worker logs for any issues
) else (
    echo ⚠️  Some workers failed to deploy. Please check the errors above.
    echo.
    echo 🔧 Troubleshooting:
    echo 1. Check your Cloudflare account status
    echo 2. Verify all secrets are properly configured
    echo 3. Check worker source files for syntax errors
    echo 4. Ensure you have proper permissions for deployment
)

echo.
pause
