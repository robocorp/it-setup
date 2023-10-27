import prompts from 'prompts';
import Table from 'easy-table';

import { Choices, InternalChoice } from './types';
import { scriptsDB } from '../db/scriptsDB';
import { ScriptDataType } from '../types';

import { getLogger } from '../log';
import { BashExe } from '../executor/bashExe';

const logger = getLogger({ force: true });

type Screen = (...data: any[]) => void;

class Inquirer {
  _screens: { screen: Screen; args?: any }[] = [];

  _goBackOneScreen = () => {
    const screen = this._screens.pop();
    screen ? screen.screen(screen.args) : this.exit();
  };

  _saveScreen = (s: { screen: Screen; args?: any }) => {
    this._screens.push(s);
  };

  exit = async () => {
    logger.info("- Sorry to see you go! Let's cook another time. 👋");
  };

  start: Screen = async () => {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'How can I help you cook?',
      choices: [
        {
          title: 'List entire fridge',
          description: 'List all available Recipes & Ingredients',
          value: Choices.LIST_ALL,
        },
        { title: 'Select Recipe', description: 'Select Recipe to cook', value: Choices.SELECT_RECIPE },
        { title: 'Select Ingredient', description: 'Select Ingredients to cook', value: Choices.SELECT_INGREDIENT },
        { title: 'Exit', description: 'Cook another day', value: Choices.EXIT },
      ],
    });

    this._screens.push({ screen: this.start });

    switch (response.value) {
      case Choices.LIST_ALL:
        this.listAll();
        break;
      case Choices.SELECT_RECIPE:
        this.selectRecipe();
        break;
      case Choices.SELECT_INGREDIENT:
        this.selectIngredient();
        break;
      case Choices.EXIT:
        this.exit();
        break;
      default:
        this.exit();
        break;
    }
  };

  listAll: Screen = async () => {
    const recipes: any[] = [];
    const ingredients: any[] = [];
    scriptsDB.entries().forEach(([k, data]) => {
      if (data.type && data.type === 'recipe')
        recipes.push({
          title: data.title,
          type: data.type,
          category: data.category,
          supported: scriptsDB.isSupported(k),
          description: data.description,
        });
      else
        ingredients.push({
          title: data.title,
          type: data.type,
          category: data.category,
          supported: scriptsDB.isSupported(k),
          description: data.description,
        });
    });

    logger.info();
    logger.warn('Here are the known recipes:');
    logger.info(Table.print(recipes));

    logger.warn('Here are the known ingredients:');
    logger.info(Table.print(ingredients));
    this._goBackOneScreen();
  };

  selectRecipe: Screen = async () => {
    let choices: InternalChoice[] = scriptsDB.recipes().map((path, index) => {
      const data = scriptsDB.get(path);
      return { title: data.title, description: data.description, value: index, path: path };
    });

    if (choices.length === 0) {
      choices = [
        { title: 'No available recipes', description: 'Walk back to the previous screen', disabled: true, value: 999 },
      ];
    }

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your recipe:',
      choices: [...choices, { title: 'Go back', description: 'Walk back to the previous screen', value: 999 }],
    });

    switch (response.value) {
      case 999:
        this._goBackOneScreen();
        return;
      default:
        const path = choices[response.value].path;
        if (path) {
          this._saveScreen({ screen: this.selectRecipe });
          const data = scriptsDB.get(path);
          this.cookIt(path, data);
        }
        return;
    }
  };

  selectIngredient: Screen = async () => {
    let choices: InternalChoice[] = scriptsDB.ingredients().map((path, index) => {
      const data = scriptsDB.get(path);
      return { title: data.title, description: data.description, value: index, path: path };
    });

    if (choices.length === 0) {
      choices = [
        {
          title: 'No available ingredients',
          description: 'Walk back to the previous screen',
          disabled: true,
          value: 999,
        },
      ];
    }

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your ingredient:',
      choices: [...choices, { title: 'Go back', description: 'Walk back to the previous screen', value: 999 }],
    });

    switch (response.value) {
      case 999:
        this._goBackOneScreen();
        return;
      default:
        const path = choices[response.value].path;
        if (path) {
          this._saveScreen({ screen: this.selectIngredient });
          const data = scriptsDB.get(path);
          this.cookIt(path, data);
        }
        return;
    }
  };

  cookIt = async (path: string, choice: ScriptDataType) => {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: `What should we do with '${choice.title}'?`,
      choices: [
        { title: 'See details', description: 'Print out the details of the script', value: 0 },
        { title: 'Cook it up', description: 'Execute script', value: 1 },
        { title: 'Go back', description: 'Walk back to the previous screen', value: 999 },
      ],
    });

    switch (response.value) {
      case 0:
        logger.info();
        logger.info(Table.print(choice));
        this.cookIt(path, choice);
        break;
      case 1:
        const exe = new BashExe();
        await exe.run(path, choice);
        this.cookIt(path, choice);
        break;
      case 999:
        this._goBackOneScreen();
        return;
      default:
        this.exit();
        return;
    }
  };
}

export const inquirer = new Inquirer();
