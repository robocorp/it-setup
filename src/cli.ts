import prompts from 'prompts';
import fs from 'fs';
import path from 'path';

// async function* walk(dir: string): any {
//   for await (const d of await fs.promises.opendir(dir)) {
//     const entry = path.join(dir, d.name);
//     if (d.isDirectory()) yield* walk(entry);
//     else if (d.isFile()) yield entry;
//   }
// }

(async () => {
  // const pathToPowershell = path.join(__dirname, '/assets/powershell/cleanup/cleanup-windows-worker.ps1');
  // const fileBuffer = fs.readFileSync(pathToPowershell);
  // console.log('FILE CONTENTS:', fileBuffer.toString());

  // for await (const p of walk(path.resolve(__dirname))) console.log(p);

  const dir = fs.readdirSync(path.resolve(__dirname));
  console.log(dir);

  const pathToPowershell = path.join(__dirname, 'powershell', 'cleanup', 'cleanup-windows-worker.ps1');
  const fileBuffer = fs.readFileSync(pathToPowershell);
  console.log('FILE CONTENTS:', fileBuffer.toString());

  const response = await prompts({
    type: 'number',
    name: 'value',
    message: 'Quick question... How old are you?',
    validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
  });

  console.log(response); // => { value: 24 }
})();
