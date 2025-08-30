@echo off
echo Deploying Content Search Worker...
echo.

cd /d "%~dp0"

echo Building and deploying worker...
wrangler deploy --config wrangler-content-search.toml

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Content Search Worker deployed successfully!
    echo Worker URL: https://content-search.rogerleecormier.workers.dev
    echo.
    echo Available endpoints:
    echo - POST /api/search - Search content
    echo - POST /api/recommendations - Get content recommendations
    echo.
) else (
    echo.
    echo Failed to deploy Content Search Worker!
    echo Error code: %ERRORLEVEL%
    echo.
)

pause
