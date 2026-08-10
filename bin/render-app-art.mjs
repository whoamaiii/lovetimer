// Rasterizes the SVG sources in assets/ into the PNGs that
// `capacitor-assets generate --ios` consumes, plus the web touch icon.
// Run via `npm run ios:assets`.
import sharp from 'sharp';

const jobs = [
  { src: 'assets/icon.svg', out: 'assets/icon-only.png', size: 1024 },
  { src: 'assets/splash.svg', out: 'assets/splash.png', size: 2732 },
  { src: 'assets/splash-dark.svg', out: 'assets/splash-dark.png', size: 2732 }
];

for (const { src, out, size } of jobs) {
  await sharp(src, { density: 96 }).resize(size, size).png().toFile(out);
  console.log(`rendered ${out}`);
}

await sharp('assets/icon-only.png')
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('rendered public/apple-touch-icon.png');
