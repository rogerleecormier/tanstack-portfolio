# PowerShell script to set up Git pre-push hook on Windows
Write-Host "Setting up Git pre-push hook for Windows..." -ForegroundColor Green

# Create the pre-push hook content
$hookContent = @"
#!/bin/sh
# Pre-push hook to run linting, type checking, and build
echo "Running pre-push checks..."

# Run the pre-push script
npm run pre-push

# Capture the exit code
EXIT_CODE=`$?

if [ `$EXIT_CODE -ne 0 ]; then
    echo "Pre-push checks failed. Please fix the issues before pushing."
    exit 1
else
    echo "All pre-push checks passed!"
    exit 0
fi
"@

# Write the hook file
$hookPath = ".git\hooks\pre-push"
$hookContent | Out-File -FilePath $hookPath -Encoding ASCII

Write-Host "Git pre-push hook created at: $hookPath" -ForegroundColor Green
Write-Host "The hook will now run automatically on git push" -ForegroundColor Yellow
Write-Host "To test: git add . && git commit -m test && git push" -ForegroundColor Cyan
