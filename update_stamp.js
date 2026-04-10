const fs = require('fs');

const stampB64 = fs.readFileSync('image-removebg-preview (7).png').toString('base64');
const newStampUri = 'data:image/png;base64,' + stampB64;

let content = fs.readFileSync('assets.js', 'utf8');
content = content.replace(/stamp:\s*"data:image\/[^"]*"/, 'stamp: "' + newStampUri + '"');
fs.writeFileSync('assets.js', content, 'utf8');

console.log('Stamp updated successfully. Size:', stampB64.length, 'chars');
