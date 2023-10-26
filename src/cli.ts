import prompts from 'prompts';
import { scriptsDB } from './db/scriptsDB';

(async () => {
  // const dir = fs.readdirSync(path.resolve(__dirname));
  // console.log(dir);

  // const pathToPowershell = path.join(__dirname, 'powershell', 'cleanup', 'cleanup-windows-worker.ps1');
  // const fileBuffer = fs.readFileSync(pathToPowershell);
  // console.log('FILE CONTENTS:', fileBuffer.toString());

  scriptsDB.walk();

  const response = await prompts({
    type: 'number',
    name: 'value',
    message: 'Quick question... How old are you?',
    validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
  });

  console.log(response); // => { value: 24 }
})();
