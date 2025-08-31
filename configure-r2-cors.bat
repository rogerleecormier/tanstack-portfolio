@echo off
echo Configuring CORS on R2 bucket...
echo.

echo Applying CORS configuration to portfolio-content bucket...
wrangler r2 bucket cors set portfolio-content --config wrangler-r2.toml --file r2-cors.json

echo.
echo CORS configuration complete!
echo Your R2 bucket should now allow requests from rcormier.dev
pause
