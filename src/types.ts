import { ExecutorTypes } from './executor';

export type ScriptOS = 'windows' | 'linux' | 'darwin';

export type ScriptCategory = 'worker' | 'ssl';

export type ScriptType = 'recipe' | 'ingredient';

export type ScriptDataType = {
  title: string;
  internalPath: string;
  internalSteps?: ScriptDataType[];
  description?: string;
  requirements?: string;
  os?: ScriptOS;
  category?: ScriptCategory;
  type?: ScriptType;
  executor?: ExecutorTypes;
};

export type ScriptDataPrintable = Omit<ScriptDataType, 'internalPath' | 'internalSteps'>;

export type ScriptDBType = {
  [pathToScript: string]: ScriptDataType;
};
