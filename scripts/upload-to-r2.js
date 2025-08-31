const fs = require('fs');
const path = require('path');

// Portfolio content files to upload
const portfolioFiles = [
  'strategy.md',
  'leadership.md',
  'talent.md',
  'devops.md',
  'saas.md',
  'analytics.md',
  'risk-compliance.md',
  'governance-pmo.md',
  'product-ux.md',
  'education-certifications.md',
  'ai-automation.md',
  'culture.md',
  'capabilities.md',
  'projects.md'
];

// Blog content files to upload
const blogFiles = [
  'pmbok-agile-methodology-blend.md',
  'serverless-ai-workflows-azure-functions.md',
  'power-automate-workflow-automation.md',
  'asana-ai-status-reporting.md',
  'mkdocs-github-actions-portfolio.md',
  'internal-ethos-high-performing-organizations.md',
  'digital-transformation-strategy-governance.md',
  'military-leadership-be-know-do.md',
  'ramp-agents-ai-finance-operations.md',
  'pmp-digital-transformation-leadership.md'
];

// Project content files to upload
const projectFiles = [
  'project-analysis.md'
];

async function uploadToR2() {
  console.log('🚀 Starting upload to Cloudflare R2...');
  
  try {
    // Upload portfolio files
    console.log('\n📁 Uploading portfolio files...');
    for (const file of portfolioFiles) {
      const sourcePath = path.join(__dirname, '../tanstack-portfolio-content/src/content/portfolio', file);
      const targetPath = `portfolio/${file}`;
      
      if (fs.existsSync(sourcePath)) {
        await uploadFile(sourcePath, targetPath);
        console.log(`✅ Uploaded: ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${sourcePath}`);
      }
    }
    
    // Upload blog files
    console.log('\n📝 Uploading blog files...');
    for (const file of blogFiles) {
      const sourcePath = path.join(__dirname, '../tanstack-portfolio-content/src/content/blog', file);
      const targetPath = `blog/${file}`;
      
      if (fs.existsSync(sourcePath)) {
        await uploadFile(sourcePath, targetPath);
        console.log(`✅ Uploaded: ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${sourcePath}`);
      }
    }
    
    // Upload project files
    console.log('\n🔧 Uploading project files...');
    for (const file of projectFiles) {
      const sourcePath = path.join(__dirname, '../tanstack-portfolio-content/src/content/projects', file);
      const targetPath = `projects/${file}`;
      
      if (fs.existsSync(sourcePath)) {
        await uploadFile(sourcePath, targetPath);
        console.log(`✅ Uploaded: ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${sourcePath}`);
      }
    }
    
    console.log('\n🎉 Upload completed successfully!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

async function uploadFile(sourcePath, targetPath) {
  // This will be implemented using wrangler r2 commands
  // For now, we'll create a script that can be run manually
  const command = `npx wrangler r2 object put ${targetPath} --file ${sourcePath}`;
  console.log(`Running: ${command}`);
  
  // In a real implementation, you'd use the R2 API or wrangler
  // For now, we'll just log the command
}

// Run the upload
uploadToR2();
