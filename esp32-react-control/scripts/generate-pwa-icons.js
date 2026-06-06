import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = path.resolve('public/biocore-logo.png');

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error('Logo biocore-logo.png not found in public/');
    process.exit(1);
  }

  console.log('Generating PWA icons...');

  // 1. Apple Touch Icon (180x180) - Solid background matching the app theme
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 17, g: 20, b: 23, alpha: 1 } // #111417
    })
    .toFile('public/apple-touch-icon.png');
  console.log('Created apple-touch-icon.png');

  // 2. PWA 192x192 - Transparent background
  await sharp(logoPath)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 17, g: 20, b: 23, alpha: 0 }
    })
    .toFile('public/pwa-192x192.png');
  console.log('Created pwa-192x192.png');

  // 3. PWA 512x512 - Transparent background for high-res screens
  await sharp(logoPath)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 17, g: 20, b: 23, alpha: 0 }
    })
    .toFile('public/pwa-512x512.png');
  console.log('Created pwa-512x512.png');

  // 4. Maskable Icon 512x512 - Requires padding (min 10% safe zone) and a solid background
  // We resize logo to 384x384 (75% of 512) to ensure it sits safely within the safe zone, then composite onto solid #111417
  const logoResized = await sharp(logoPath)
    .resize(384, 384, {
      fit: 'contain',
      background: { r: 17, g: 20, b: 23, alpha: 0 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 17, g: 20, b: 23, alpha: 1 } // #111417
    }
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .toFile('public/maskable-icon-512x512.png');
  console.log('Created maskable-icon-512x512.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
