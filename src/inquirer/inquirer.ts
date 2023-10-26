import prompts from 'prompts';
import Table from 'easy-table';

import { Choices } from './types';
import { scriptsDB } from '../db/scriptsDB';
import { ScriptDataType } from '../types';

import { getLogger } from '../log';

const logger = getLogger({ force: true });

type Screen = (...data: any[]) => void;

class Inquirer {
  _screens: { screen: Screen; args?: any }[] = [];

  exit = async () => {
    logger.info("- Sorry to see you go! Let's cook another time. 👋");
  };

  chooseScriptExe = async (choice: ScriptDataType) => {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: `What should we do with '${choice.title}'?`,
      choices: [
        { title: 'See details', description: 'Print out the details of the script', value: 0 },
        { title: 'Execute', description: 'Execute script', value: 1 },
        { title: 'Go back', description: 'Walk back to the previous screen', value: 999 },
      ],
    });

    switch (response.value) {
      case 0:
        logger.info(Table.print(choice));
        this.chooseScriptExe(choice);
        break;
      case 999:
        const screen = this._screens.pop();
        screen ? screen.screen(screen.args) : this.exit();
        return;
      default:
        this.exit();
        return;
    }
  };

  listRecipes: Screen = async () => {
    const choices = scriptsDB.recipes().map((name, index) => {
      const data = scriptsDB.get(name);
      return { title: data.title, description: data.description, value: index, name: name };
    });

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your recipe:',
      choices: [...choices, { title: 'Go back', description: 'Walk back to the previous screen', value: 999 }],
    });

    switch (response.value) {
      case 999:
        const screen = this._screens.pop();
        screen ? screen.screen(screen.args) : this.exit();
        return;
      default:
        this._screens.push({ screen: this.listRecipes });
        const data = scriptsDB.get(choices[response.value].name);
        this.chooseScriptExe(data);
        return;
    }
  };

  start: Screen = async () => {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'How can I help you cook?',
      choices: [
        { title: 'List Recipes', description: 'Lists all available Recipes', value: Choices.LIST_RECIPES },
        { title: 'List Ingredients', description: 'Lists all available Ingredients', value: Choices.LIST_INGREDIENTS },
        { title: 'Exit', description: 'Cook another day', value: Choices.EXIT },
      ],
    });

    this._screens.push({ screen: this.start });

    switch (response.value) {
      case Choices.LIST_RECIPES:
        this.listRecipes();
        break;
      case Choices.EXIT:
        this.exit();
        break;
      default:
        this.exit();
        break;
    }
  };
}

export const inquirer = new Inquirer();
