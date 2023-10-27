import { Choice } from 'prompts';

export interface InternalChoice extends Choice {
  path?: string;
}

export const enum Choices {
  EXIT = 'exit',
  LIST_ALL = 'list_all',
  SELECT_RECIPE = 'select_recipes',
  SELECT_INGREDIENT = 'select_ingredients',
}
