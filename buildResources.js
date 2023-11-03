const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

console.log(`--- Building Fridge for RoboChef`);

console.log(`== Copying package.json ...`);
fse.copySync('./package.json', './lib/package.json');
console.log(`== Copying powershell ...`);
fse.copySync('./powershell', './lib/it-setup/powershell');
console.log(`== Copying bash ...`);
fse.copySync('./bash', './lib/it-setup/bash');
console.log(`== Copying python ...`);
fse.copySync('./python', './lib/it-setup/python');
console.log(`== Copying recipes ...`);
fse.copySync('./recipes', './lib/it-setup/recipes');

if (process.env['NODE_ENV'] !== 'development') {
  console.log(`== Cleaning up test subjects...`);
  fse.removeSync('./lib/it-setup//powershell/tests');
  fse.removeSync('./lib/it-setup/bash/tests');
  fse.removeSync('./lib/it-setup//python/tests');
  fse.removeSync('./lib//it-setup/recipes/tests');
}

console.log('--- The Fridge is complete! Carry on!');
