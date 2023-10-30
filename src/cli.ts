import figlet from 'figlet';
import { scriptsDB } from './db/scriptsDB';

import * as packageJSON from '../package.json';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { sleep } from './utils';
import { inquirer } from './inquirer';
import { ExecutorTypes } from './executor';

(async () => {
  const HELP_PRESENTATION = `
Hi, I'm ${packageJSON.name.toUpperCase()}. Here is what I can do for you:
- '${packageJSON.name}' is a CLI tool that helps with diagnosing and execute actions on the environment
- '${packageJSON.name}' can execute different Recipes & Ingredients:
--- 'Ingredients' = are atomic scripts with a simple and straight forward functionality
--- 'Recipes' = are a collection of ingredients (atomic scripts/functions) to create more complex functionality
- the Recipes and Ingredients are stored in the Fridge (the internal Database)
- the available sous-chefs (Executors) are: ${Object.keys(ExecutorTypes).join(' | ')}
- you can always build your own Recipes from available Ingredients or a combination of other Recipes
- new Recipes can be stored for future use
`;

  console.log(
    chalk.magentaBright(
      figlet.textSync(`${packageJSON.name} - ${packageJSON.version}`, {
        font: '3D-ASCII',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  console.log(chalk.cyanBright(HELP_PRESENTATION));

  const spinner = createSpinner('Searching the fridge...').start();
  console.log();
  scriptsDB.walk();

  await sleep(1000);
  if (scriptsDB.isEmpty()) {
    spinner.error({ text: 'Fridge is empty! Try and debug the issue if you dare.' });
    process.exit(1);
  }
  spinner.success({ text: 'Your chef is ready to go! 🧑‍🍳' });
  inquirer.start();
})();
