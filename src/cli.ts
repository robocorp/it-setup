import figlet from 'figlet';
import { scriptsDB } from './db/scriptsDB';

import * as packageJSON from '../package.json';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { sleep } from './utils';
import { inquirer } from './inquirer/inquirer';

(async () => {
  console.log(
    chalk.magentaBright(
      figlet.textSync(`roboit - ${packageJSON.version}`, {
        font: '3D-ASCII',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  const spinner = createSpinner('Searching the fridge...').start();
  scriptsDB.walk();

  await sleep(1000);
  if (scriptsDB.isEmpty()) {
    spinner.error({ text: 'Fridge is empty! Try and debug the issue if you dare.' });
    process.exit(1);
  }
  spinner.success({ text: 'Your chef is ready to go! 🧑‍🍳' });
  inquirer.start();
})();
