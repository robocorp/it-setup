const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

console.log(`=== Copying package.json ...`);
fse.copySync('./package.json', './lib/package.json');
console.log(`=== Copying powershell ...`);
fse.copySync('./powershell', './lib/powershell');
console.log(`=== Copying bash ...`);
fse.copySync('./bash', './lib/bash');
console.log(`=== Copying recipes ...`);
fse.copySync('./recipes', './lib/recipes');

console.log('=== Done');
