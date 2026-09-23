const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const files = [
  ...fs.readdirSync(ROOT).filter(file => file.endsWith('.html')).map(file => path.join(ROOT, file)),
  ...fs.readdirSync(path.join(ROOT, 'templates')).filter(file => file.endsWith('.html')).map(file => path.join(ROOT, 'templates', file)),
];

function numberAttr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="?(\\d+)`, 'i'));
  return match ? Number(match[1]) : null;
}

function dimensionsFromUrl(src) {
  const wix = src.match(/(?:crop\/x_\d+,y_\d+,w_|fill\/w_)(\d+),h_(\d+)/i);
  return wix ? { width: Number(wix[1]), height: Number(wix[2]) } : null;
}

async function localDimensions(src, htmlFile) {
  if (!src || /^(?:https?:|data:|\{\{)/i.test(src)) return null;
  const clean = decodeURIComponent(src.split('#')[0].split('?')[0]).replace(/^\.\//, '');
  const base = htmlFile.includes(`${path.sep}templates${path.sep}`) ? ROOT : path.dirname(htmlFile);
  const target = path.resolve(base, clean);
  if (!target.startsWith(ROOT) || !fs.existsSync(target)) return null;
  try {
    const metadata = await sharp(target).metadata();
    return metadata.width && metadata.height ? { width: metadata.width, height: metadata.height } : null;
  } catch {
    return null;
  }
}

async function optimizeTag(tag, htmlFile) {
  const srcMatch = tag.match(/\ssrc="([^"]+)"/i);
  if (!srcMatch) return tag;

  let width = numberAttr(tag, 'width');
  let height = numberAttr(tag, 'height');
  if (width && height) return /\sdecoding=/i.test(tag) ? tag : tag.replace(/\s*\/?>(\s*)$/, ' decoding="async"/>$1');

  const source = dimensionsFromUrl(srcMatch[1]) || await localDimensions(srcMatch[1], htmlFile);
  if (!source) return tag;

  if (width && !height) height = Math.max(1, Math.round(width * source.height / source.width));
  if (height && !width) width = Math.max(1, Math.round(height * source.width / source.height));
  width = width || source.width;
  height = height || source.height;

  const additions = `${numberAttr(tag, 'width') ? '' : ` width="${width}"`}${numberAttr(tag, 'height') ? '' : ` height="${height}"`}${/\sdecoding=/i.test(tag) ? '' : ' decoding="async"'}`;
  return tag.replace(/\s*\/?>(\s*)$/, `${additions}/>$1`);
}

async function optimizeFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(/<img\b[^>]*>/gi)];
  let output = html;
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    const replacement = await optimizeTag(match[0], file);
    output = output.slice(0, match.index) + replacement + output.slice(match.index + match[0].length);
  }
  if (output !== html) fs.writeFileSync(file, output);
  return matches.filter(match => /\swidth=/i.test(match[0]) && /\sheight=/i.test(match[0])).length;
}

(async () => {
  for (const file of files) await optimizeFile(file);
  console.log(`  images → added intrinsic dimensions where source metadata was available (${files.length} HTML files checked)`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
