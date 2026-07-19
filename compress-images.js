const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = __dirname;
const TARGET_DIRS = [ROOT_DIR, path.join(ROOT_DIR, 'blog-images')];
const MIN_SIZE_BYTES = 200 * 1024; // 200KB
const JPG_QUALITY = 80;
const PNG_QUALITY = 80;

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + 'KB';
}

function getImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png)$/i.test(f))
    .map(f => path.join(dir, f))
    .filter(f => fs.statSync(f).isFile());
}

async function compressImage(filePath) {
  const originalSize = fs.statSync(filePath).size;

  if (originalSize < MIN_SIZE_BYTES) {
    console.log(`SKIP  ${path.relative(ROOT_DIR, filePath)} (${formatBytes(originalSize)}, under 200KB)`);
    return { skipped: true, originalSize, newSize: originalSize };
  }

  const ext = path.extname(filePath).toLowerCase();
  const inputBuffer = fs.readFileSync(filePath);

  let outputBuffer;
  try {
    const image = sharp(inputBuffer);
    if (ext === '.jpg' || ext === '.jpeg') {
      outputBuffer = await image.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
    } else {
      outputBuffer = await image.png({ quality: PNG_QUALITY, palette: true, compressionLevel: 9 }).toBuffer();
    }
  } catch (err) {
    console.log(`ERROR ${path.relative(ROOT_DIR, filePath)}: ${err.message}`);
    return { skipped: true, originalSize, newSize: originalSize };
  }

  // Only overwrite if compression actually shrank the file
  if (outputBuffer.length < originalSize) {
    fs.writeFileSync(filePath, outputBuffer);
  } else {
    outputBuffer = inputBuffer;
  }

  const newSize = outputBuffer.length;
  console.log(`${path.relative(ROOT_DIR, filePath)}: ${formatBytes(originalSize)} -> ${formatBytes(newSize)}`);
  return { skipped: false, originalSize, newSize };
}

async function main() {
  const files = TARGET_DIRS.flatMap(getImageFiles);

  let totalOriginal = 0;
  let totalNew = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const result = await compressImage(file);
    totalOriginal += result.originalSize;
    totalNew += result.newSize;
    if (result.skipped) {
      skippedCount++;
    } else {
      processedCount++;
    }
  }

  const saved = totalOriginal - totalNew;
  const savedPct = totalOriginal > 0 ? ((saved / totalOriginal) * 100).toFixed(1) : '0.0';

  console.log('\n--- Summary ---');
  console.log(`Files found:     ${files.length}`);
  console.log(`Compressed:      ${processedCount}`);
  console.log(`Skipped:         ${skippedCount}`);
  console.log(`Total before:    ${formatBytes(totalOriginal)}`);
  console.log(`Total after:     ${formatBytes(totalNew)}`);
  console.log(`Space saved:     ${formatBytes(saved)} (${savedPct}%)`);
}

main().catch(err => {
  console.error('Compression failed:', err);
  process.exit(1);
});
