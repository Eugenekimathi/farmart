const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const client = path.join(workspace, 'client');

function walk(dir, exts, files=[]) {
  const names = fs.readdirSync(dir);
  for (const name of names) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, exts, files);
    else if (exts.includes(path.extname(name))) files.push(full);
  }
  return files;
}

const exts = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html'];
const files = walk(path.join(client, 'src'), exts).concat(walk(path.join(client, 'public'), exts)).concat([path.join(client, 'index.html')].filter(fs.existsSync));

const assetPattern = new RegExp('(["' + "'`" + '])((?:\\.\\.|\\.\/|\/)?[^"' + "'`" + ']+?\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf))\\1', 'gi');
const missing = [];

for (const file of files) {
  const txt = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = assetPattern.exec(txt)) !== null) {
    const raw = m[2];
    let candidate;
    if (raw.startsWith('/')) {
      // public root: check both client/<file> and client/public/<file>
      const without = raw.replace(/^\//, '');
      const candidatePublic = path.join(client, 'public', without);
      const candidateRoot = path.join(client, without);
      candidate = fs.existsSync(candidatePublic) ? candidatePublic : candidateRoot;
    } else if (raw.startsWith('..') || raw.startsWith('.')) {
      candidate = path.resolve(path.dirname(file), raw);
    } else if (raw.startsWith('src/') ) {
      candidate = path.join(client, raw);
    } else {
      // try relative to file
      candidate = path.resolve(path.dirname(file), raw);
      if (!fs.existsSync(candidate)) candidate = path.join(client, raw);
    }
    if (!fs.existsSync(candidate)) {
      missing.push({file: path.relative(workspace, file), reference: raw, looked: path.relative(workspace, candidate)});
    }
  }
}

console.log(JSON.stringify({checked: files.length, missing}, null, 2));
