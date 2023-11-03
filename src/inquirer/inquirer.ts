import prompts from 'prompts';

const PromptSort = require('prompt-sort');

import { scriptsDB } from '../db';
import { getLogger } from '../log';
import { ScriptDataPrintable, ScriptDataType, ScriptType } from '../types';
import { BashExe, ExecutorFactory } from '../executor';

import { Choices, InternalChoice } from './types';

const logger = getLogger({ force: true });

type Screen = (...data: any[]) => void;

class Inquirer {
  _screens: { screen: Screen; args?: any }[] = [];

  _goBackOneScreen = async () => {
    const screen = this._screens.pop();
    screen ? screen.screen(screen.args) : this.exit();
  };

  _saveScreen = (s: { screen: Screen; args?: any }) => {
    this._screens.push(s);
  };

  exit = async () => {
    logger.info('- Sorry to see you go! Have a great day! 👋');
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
        {
          title: 'Build your own recipe',
          description: 'Select recipes & ingredients to create a new recipe',
          value: Choices.CREATE_RECIPE,
        },
        { title: 'Select recipe(s)', description: 'Select recipe(s) to cook', value: Choices.SELECT_RECIPE },
        {
          title: 'Select ingredient(s)',
          description: 'Select ingredient(s) to cook',
          value: Choices.SELECT_INGREDIENT,
        },
        { title: 'Exit', description: 'Cook another day', value: Choices.EXIT },
      ],
    });

    this._screens.push({ screen: this.start });

    switch (response.value) {
      case Choices.LIST_ALL:
        this.listAll();
        break;
      case Choices.CREATE_RECIPE:
        this.selectMultiple('all');
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
    const recipes: ScriptDataPrintable[] = [];
    const ingredients: ScriptDataPrintable[] = [];
    const unknown: ScriptDataPrintable[] = [];
    scriptsDB.entries().forEach(([, data]) => {
      if (data.type && data.type === 'recipe') recipes.push(scriptsDB.getPrintableData(data));
      else if (data.type && data.type === 'ingredient') ingredients.push(scriptsDB.getPrintableData(data));
      else unknown.push(scriptsDB.getPrintableData(data));
    });

    await logger.output('The Fridge (DB)', () => {
      if (recipes.length > 0) {
        logger.warn('Here are the known recipes:');
        logger.info(scriptsDB.getTableData(recipes));
      } else {
        logger.error('There are no recipes in the fridge.');
      }

      if (ingredients.length > 0) {
        logger.warn('Here are the known ingredients:');
        logger.info(scriptsDB.getTableData(ingredients));
      } else {
        logger.error('There are no ingredients in the fridge.');
      }
      if (unknown.length > 0) {
        logger.warn('Here are the unknowns:');
        logger.info(scriptsDB.getTableData(unknown));
      } else {
        logger.warn('There are no unknowns.');
      }
    });
    this._goBackOneScreen();
  };

  selectRecipe: Screen = async () => {
    let choices: (InternalChoice | undefined)[] = scriptsDB
      .recipes()
      .sort((a, b) => (scriptsDB.isSupported(a) && !scriptsDB.isSupported(b) ? -1 : 1))
      .map((path, index) => {
        const data = scriptsDB.get(path);
        return data
          ? {
              title: data.title,
              description:
                data.executor && data.description
                  ? `(${data.executor?.toLocaleLowerCase()}) ${data.description}`
                  : data.description,
              value: index,
              path: path,
              disabled: !scriptsDB.isSupported(path),
            }
          : undefined;
      });

    const cleanChoices = choices.filter((choice): choice is InternalChoice => !!choice);

    const allDisabled = cleanChoices.every((choice) => choice.disabled === true);

    if (cleanChoices.length === 0) {
      cleanChoices.push({
        title: 'No available recipes',
        description: 'Walk back to the previous screen',
        disabled: true,
        value: 999,
        path: '',
      });
    }

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your recipe:',
      warn: 'Recipe cannot be ordered on this OS',
      choices: [
        {
          title: '> Prepare your own recipe',
          description: 'Select multiple recipes & cook your own',
          value: -1,
          disabled: allDisabled,
        },
        ...cleanChoices,
        { title: '< Go back', description: 'Walk back to the previous screen', value: 999 },
      ],
    });

    if (response.value === undefined) {
      this._goBackOneScreen();
      return;
    }

    switch (response.value) {
      case -1:
        this._saveScreen({ screen: this.selectRecipe });
        this.selectMultiple('recipe');
        break;
      case 999:
        this._goBackOneScreen();
        return;
      default:
        const path = cleanChoices[response.value] ? cleanChoices[response.value].path : undefined;
        if (path) {
          this._saveScreen({ screen: this.selectRecipe });
          const data = scriptsDB.get(path);
          this.cookIt(data);
        }
        return;
    }
  };

  selectIngredient: Screen = async () => {
    let choices: (InternalChoice | undefined)[] = scriptsDB
      .ingredients()
      .sort((a, b) => (scriptsDB.isSupported(a) && !scriptsDB.isSupported(b) ? -1 : 1))
      .map((path, index) => {
        const data = scriptsDB.get(path);
        return data
          ? {
              title: data.title,
              description:
                data.executor && data.description
                  ? `(${data.executor?.toLocaleLowerCase()}) ${data.description}`
                  : data.description,
              value: index,
              path: path,
              disabled: !scriptsDB.isSupported(path),
            }
          : undefined;
      });
    const cleanChoices = choices.filter((choice): choice is InternalChoice => !!choice);

    const allDisabled = cleanChoices.every((choice) => choice.disabled === true);

    if (cleanChoices.length === 0) {
      cleanChoices.push({
        title: 'No available ingredients',
        description: 'Walk back to the previous screen',
        disabled: true,
        value: 999,
        path: '',
      });
    }

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your ingredient:',
      hint: 'Use arrow-keys. Return to submit. Esc to go back.',
      warn: 'Ingredient cannot be ordered on this OS',
      choices: [
        {
          title: '> Prepare your own recipe',
          description: 'Select multiple ingredients & cook your own recipe',
          disabled: allDisabled,
          value: -1,
        },
        ...cleanChoices,
        { title: '< Go back', description: 'Walk back to the previous screen', value: 999 },
      ],
    });

    if (response.value === undefined) {
      this._goBackOneScreen();
      return;
    }

    switch (response.value) {
      case -1:
        this._saveScreen({ screen: this.selectIngredient });
        this.selectMultiple('ingredient');
        logger.info('>>>> YES - I RAN AFTER MULTIPLE...');
        break;
      case 999:
        this._goBackOneScreen();
        return;
      default:
        if (cleanChoices[response.value]) {
          const path = cleanChoices[response.value].path;
          if (path) {
            this._saveScreen({ screen: this.selectIngredient });
            const data = scriptsDB.get(path);
            this.cookIt(data);
          }
        }
        return;
    }
  };

  selectMultiple = async (type: ScriptType) => {
    let choices: (InternalChoice | undefined)[];
    switch (type) {
      case 'ingredient':
        choices = scriptsDB
          .ingredients()
          .sort((a, b) => (scriptsDB.isSupported(a) && !scriptsDB.isSupported(b) ? -1 : 1))
          .map((path, index) => {
            const data = scriptsDB.get(path);
            return data && scriptsDB.isSupported(path)
              ? { title: data.title, description: data.description, value: index, path: path }
              : undefined;
          });
        break;
      case 'recipe':
        choices = scriptsDB
          .recipes()
          .sort((a, b) => (scriptsDB.isSupported(a) && !scriptsDB.isSupported(b) ? -1 : 1))
          .map((path, index) => {
            const data = scriptsDB.get(path);
            return data && scriptsDB.isSupported(path)
              ? { title: data.title, description: data.description, value: index, path: path }
              : undefined;
          });
        break;
      default:
        choices = scriptsDB
          .keys()
          .sort((a, b) => (scriptsDB.isSupported(a) && !scriptsDB.isSupported(b) ? -1 : 1))
          .map((path, index) => {
            const data = scriptsDB.get(path);
            const isRecipe = data?.type === 'recipe';
            return data && scriptsDB.isSupported(path)
              ? {
                  title: isRecipe ? `(recipe) ${data.title}` : `(ingredient) ${data.title}`,
                  description: data.description,
                  value: index,
                  path: path,
                }
              : undefined;
          });
    }

    const cleanChoices = choices.filter((choice): choice is InternalChoice => !!choice);

    logger.debug('These are the clean choices:', JSON.stringify(cleanChoices, undefined, 4));

    const response = await prompts({
      type: 'multiselect',
      name: 'value',
      message: `Pick & choose what ${type}(s) you'd like:`,

      choices: [...cleanChoices],
      hint: '- Space to select | Return to submit | Esc to go back',
    });

    logger.debug('These are the picks:', JSON.stringify(response.value, undefined, 4));

    if (response.value === undefined) {
      this._goBackOneScreen();
      return;
    }
    var prompt = new PromptSort({
      name: 'colors',
      message: `Order ${type}(s) as you please - Shift + Up/Down to reorder | Enter to submit`,
      choices: response.value
        ? response.value.map((i: number) => {
            logger.debug(`Creating elem to order: position ${i}`, cleanChoices[i]);
            const choice = cleanChoices.find((c) => c.value === i);
            return `${choice?.title} - original[${i}]`;
          })
        : [],
    });

    const sortedList: string[] = await prompt.run();

    logger.debug('Sorted List:', JSON.stringify(sortedList));

    const regex = /original\[(.*?)\]/;
    const sortedIndexes: number[] = sortedList.map((val) => {
      const match = regex.exec(val);
      return match ? parseInt(match[1]) : 0;
    });

    logger.debug('Sorted Indexes:', JSON.stringify(sortedIndexes));
    this.cookThem(
      sortedIndexes.map((i) => {
        const choice = cleanChoices.find((c) => c.value === i);
        return choice ? scriptsDB.get(choice.path) : undefined;
      }),
    );
  };

  cookIt = async (choice: ScriptDataType | undefined) => {
    if (!choice) {
      logger.warn('Cooking choice is undefined');
      return;
    }
    const choices = [
      { title: 'See details', description: 'Print out the details of the script', value: 0 },
      { title: 'Cook it up', description: 'Execute order', value: 1 },
      { title: '< Go back', description: 'Walk back to the previous screen', value: 999 },
    ];

    if (scriptsDB.isUserRecipe(choice)) {
      choices.splice(-2, 0, {
        title: 'Forget it',
        description: `Remove the ${choice.type || 'script'} from memory`,
        value: 888,
      });
    }
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: `What should we do with '${choice.title}'?`,
      choices,
    });

    if (response.value === undefined) {
      this._goBackOneScreen();
      return;
    }

    switch (response.value) {
      case 0:
        await logger.output(`'${choice.title}' details:`, () => {
          logger.info(scriptsDB.getTableData(scriptsDB.getPrintableData(choice)));
        });
        await scriptsDB.printInternalSteps(choice, logger);
        this.cookIt(choice);
        break;
      case 1:
        const exe = ExecutorFactory(choice);
        if (exe !== undefined && exe.run) {
          await exe.run(choice);
          logger.info();
          this.cookIt(choice);
        }
        break;
      case 888:
        const response = await prompts({
          type: 'confirm',
          name: 'value',
          message: 'Can you confirm?',
          initial: true,
        });
        if (response.value) {
          scriptsDB.deleteUserRecipe(choice);
          this._goBackOneScreen();
          return;
        }
        this.cookIt(choice);
        return;
      case 999:
        this._goBackOneScreen();
        return;
      default:
        this.exit();
        return;
    }
  };

  cookThem = async (choices: (ScriptDataType | undefined)[]) => {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: `What should we do with your new recipe?`,
      choices: [
        { title: 'Print recipe', description: 'Print out recipe with the execution order', value: 1 },
        { title: 'Save recipe', description: 'Saves the current recipe for future uses', value: 2 },
        { title: 'Cook it up', description: 'Execute the newly created recipe', value: 3 },
        { title: '< Go back', description: 'Walk back to the previous screen', value: 999 },
      ],
    });

    if (response.value === undefined) {
      this._goBackOneScreen();
      return;
    }

    switch (response.value) {
      case 1:
        await logger.output('Current recipe:', () => {
          logger.info(
            scriptsDB.getTableData(
              choices.map((value, index) => {
                return value
                  ? {
                      step: `Step ${index + 1}`,
                      title: value.title,
                      description: value.description,
                    }
                  : undefined;
              }),
            ),
          );
        });
        this.cookThem(choices);
        break;
      case 2:
        const response = await prompts({
          type: 'text',
          name: 'name',
          message: 'What should be the recipe name?',
        });
        scriptsDB.saveUserRecipe(response.name, choices);
        this.cookThem(choices);
        break;
      case 3:
        const exe = new BashExe();
        for (let i = 0; i < choices.length; i++) {
          await exe.run(choices[i]);
        }
        this._goBackOneScreen();
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
