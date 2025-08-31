import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Favicon sizes for different platforms
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

// SVG template for the crosshairs bullseye logo
const svgTemplate = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- White background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1875)}" fill="white"/>
  
  <!-- Crosshairs bullseye design -->
  <g>
    <!-- Outer bullseye ring -->
    <circle cx="${size/2}" cy="${size/2}" r="${Math.round(size * 0.4375)}" fill="none" stroke="url(#outerRingGradient)" stroke-width="${Math.max(1, Math.round(size * 0.03125))}"/>
    
    <!-- Middle bullseye ring -->
    <circle cx="${size/2}" cy="${size/2}" r="${Math.round(size * 0.3125)}" fill="none" stroke="url(#middleRingGradient)" stroke-width="${Math.max(1, Math.round(size * 0.03125))}"/>
    
    <!-- Inner bullseye ring -->
    <circle cx="${size/2}" cy="${size/2}" r="${Math.round(size * 0.1875)}" fill="none" stroke="url(#innerRingGradient)" stroke-width="${Math.max(1, Math.round(size * 0.03125))}"/>
    
    <!-- Horizontal crosshair line -->
    <line x1="${Math.round(size * 0.125)}" y1="${size/2}" x2="${Math.round(size * 0.875)}" y2="${size/2}" stroke="url(#crosshairGradient)" stroke-width="${Math.max(1, Math.round(size * 0.03125))}" stroke-linecap="round"/>
    
    <!-- Vertical crosshair line -->
    <line x1="${size/2}" y1="${Math.round(size * 0.125)}" x2="${size/2}" y2="${Math.round(size * 0.875)}" stroke="url(#crosshairGradient)" stroke-width="${Math.max(1, Math.round(size * 0.03125))}" stroke-linecap="round"/>
    
    <!-- Center dot -->
    <circle cx="${size/2}" cy="${size/2}" r="${Math.max(1, Math.round(size * 0.0625))}" fill="url(#centerGradient)"/>
  </g>
  
  <!-- Gradient definitions -->
  <defs>
    <linearGradient id="outerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00D4FF;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="middleRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0099FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00E6FF;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="innerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00CCFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00F0FF;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="crosshairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0099FF;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#00F5FF;stop-opacity:0.9" />
    </linearGradient>
    
    <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00D4FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00F5FF;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;

// Generate favicon files
console.log('Generating favicon files...');

faviconSizes.forEach(({ name, size }) => {
  const svgContent = svgTemplate(size);
  const filePath = path.join(__dirname, '..', 'public', name.replace('.png', '.svg'));
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated: ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\nFavicon generation complete!');
console.log('Note: These are SVG files. To convert to PNG, you can use online tools or image editing software.');
console.log('Recommended online converters:');
console.log('- https://convertio.co/svg-png/');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- https://www.icoconverter.com/');
