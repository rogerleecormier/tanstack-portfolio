# PowerShell script to upload content to Cloudflare R2
Write-Host "Starting upload to Cloudflare R2..." -ForegroundColor Green

Write-Host "`nChecking R2 bucket status..." -ForegroundColor Yellow
npx wrangler r2 bucket list

Write-Host "`nUploading portfolio files..." -ForegroundColor Cyan

# Portfolio files
$portfolioFiles = @(
    "strategy.md",
    "leadership.md", 
    "talent.md",
    "devops.md",
    "saas.md",
    "analytics.md",
    "risk-compliance.md",
    "governance-pmo.md",
    "product-ux.md",
    "education-certifications.md",
    "ai-automation.md",
    "culture.md",
    "capabilities.md",
    "projects.md"
)

foreach ($file in $portfolioFiles) {
    $sourcePath = "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\$file"
    $targetPath = "tanstack-portfolio-r2/portfolio/$file"
    
    if (Test-Path $sourcePath) {
        Write-Host "Uploading $file..." -ForegroundColor White
        npx wrangler r2 object put $targetPath --file $sourcePath --remote
    } else {
        Write-Host "File not found: $sourcePath" -ForegroundColor Red
    }
}

Write-Host "`nUploading blog files..." -ForegroundColor Cyan

# Blog files
$blogFiles = @(
    "pmbok-agile-methodology-blend.md",
    "serverless-ai-workflows-azure-functions.md",
    "power-automate-workflow-automation.md",
    "asana-ai-status-reporting.md",
    "mkdocs-github-actions-portfolio.md",
    "internal-ethos-high-performing-organizations.md",
    "digital-transformation-strategy-governance.md",
    "military-leadership-be-know-do.md",
    "ramp-agents-ai-finance-operations.md",
    "pmp-digital-transformation-leadership.md"
)

foreach ($file in $blogFiles) {
    $sourcePath = "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\$file"
    $targetPath = "tanstack-portfolio-r2/blog/$file"
    
    if (Test-Path $sourcePath) {
        Write-Host "Uploading $file..." -ForegroundColor White
        npx wrangler r2 object put $targetPath --file $sourcePath --remote
    } else {
        Write-Host "File not found: $sourcePath" -ForegroundColor Red
    }
}

Write-Host "`nUploading project files..." -ForegroundColor Cyan

# Project files
$projectFiles = @(
    "project-analysis.md"
)

foreach ($file in $projectFiles) {
    $sourcePath = "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\projects\$file"
    $targetPath = "tanstack-portfolio-r2/projects/$file"
    
    if (Test-Path $sourcePath) {
        Write-Host "Uploading $file..." -ForegroundColor White
        npx wrangler r2 object put $targetPath --file $sourcePath --remote
    } else {
        Write-Host "File not found: $sourcePath" -ForegroundColor Red
    }
}

Write-Host "`nUpload completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Enable public access to your R2 bucket in Cloudflare dashboard" -ForegroundColor White
Write-Host "2. Test your application - it should now load content from R2" -ForegroundColor White
Write-Host "3. Check browser console for R2 loading logs" -ForegroundColor White

Read-Host "`nPress Enter to continue"
