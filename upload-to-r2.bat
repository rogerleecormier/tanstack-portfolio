@echo off
echo Starting upload to Cloudflare R2...

echo.
echo Checking R2 bucket status...
npx wrangler r2 bucket list

echo.
echo Uploading portfolio files...
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/strategy.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\strategy.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/leadership.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\leadership.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/talent.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\talent.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/devops.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\devops.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/saas.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\saas.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/analytics.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\analytics.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/risk-compliance.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\risk-compliance.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/governance-pmo.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\governance-pmo.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/product-ux.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\product-ux.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/education-certifications.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\education-certifications.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/ai-automation.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\ai-automation.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/culture.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\culture.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/capabilities.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\capabilities.md"
npx wrangler r2 object put tanstack-portfolio-r2/portfolio/projects.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\portfolio\projects.md"

echo.
echo Uploading blog files...
npx wrangler r2 object put tanstack-portfolio-r2/blog/pmbok-agile-methodology-blend.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\pmbok-agile-methodology-blend.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/serverless-ai-workflows-azure-functions.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\serverless-ai-workflows-azure-functions.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/power-automate-workflow-automation.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\power-automate-workflow-automation.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/asana-ai-status-reporting.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\asana-ai-status-reporting.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/mkdocs-github-actions-portfolio.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\mkdocs-github-actions-portfolio.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/internal-ethos-high-performing-organizations.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\internal-ethos-high-performing-organizations.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/digital-transformation-strategy-governance.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\digital-transformation-strategy-governance.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/military-leadership-be-know-do.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\military-leadership-be-know-do.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/ramp-agents-ai-finance-operations.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\ramp-agents-ai-finance-operations.md"
npx wrangler r2 object put tanstack-portfolio-r2/blog/pmp-digital-transformation-leadership.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\blog\pmp-digital-transformation-leadership.md"

echo.
echo Uploading project files...
npx wrangler r2 object put tanstack-portfolio-r2/projects/project-analysis.md --file "C:\Users\RCormier\Downloads\cursor-dev\tanstack-portfolio-content\src\content\projects\project-analysis.md"

echo.
echo Upload completed successfully!
echo.
echo Next steps:
echo 1. Enable public access to your R2 bucket in Cloudflare dashboard
echo 2. Test your application - it should now load content from R2
echo 3. Check browser console for R2 loading logs
pause
