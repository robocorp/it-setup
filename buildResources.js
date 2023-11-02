const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

console.log(`--- Building Fridge for RoboChef`);

console.log(`=== Copying package.json ...`);
fse.copySync('./package.json', './lib/package.json');
console.log(`=== Copying powershell ...`);
fse.copySync('./powershell', './lib/powershell');
console.log(`=== Copying bash ...`);
fse.copySync('./bash', './lib/bash');
console.log(`=== Copying recipes ...`);
fse.copySync('./recipes', './lib/recipes');

if (process.env['NODE_ENV'] !== 'development') {
  console.log(`=== Cleaning up test subjects...`);
  fse.removeSync('./lib/powershell/tests');
  fse.removeSync('./lib/bash/tests');
  fse.removeSync('./lib/recipes/tests');
}

console.log('--- The Fridge is complete! Carry on!');
