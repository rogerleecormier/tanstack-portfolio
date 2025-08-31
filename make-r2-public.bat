@echo off
echo Making R2 bucket publicly accessible...
echo.

echo Setting bucket to public...
wrangler r2 bucket public tanstack-portfolio-r2

echo.
echo Bucket is now public!
echo You should now be able to access content at:
echo https://tanstack-portfolio-r2.r2.dev/portfolio/analytics.md
pause
