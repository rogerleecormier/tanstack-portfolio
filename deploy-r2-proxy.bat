@echo off
echo Deploying R2 Content Proxy Worker...
echo.

echo Building worker...
npm run build

echo.
echo Deploying to Cloudflare...
wrangler deploy --config wrangler-r2-proxy.toml --env production

echo.
echo Worker deployment complete!
echo Your content should now be accessible with proper CORS headers.
pause
