import os from 'os';
import path from 'path';
import { ExecutorTypes } from './executor';

export const TEMP_FOLDER_PATH = path.join(os.tmpdir(), 'robochef-user-recipes');

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getExecutorFromExt = (scriptPath: string): ExecutorTypes | undefined => {
  if (scriptPath.endsWith('.js')) {
    return ExecutorTypes.JS;
  }
  if (scriptPath.endsWith('.sh') || scriptPath.endsWith('.bash')) {
    return ExecutorTypes.BASH;
  }
  if (scriptPath.endsWith('.ps1')) {
    return ExecutorTypes.POWERSHELL;
  }
  return undefined;
};
