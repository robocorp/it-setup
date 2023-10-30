import { ExecutorTypes, IExecutor } from './types';
import { JSExe } from './exeJS';

import { ScriptDataType } from '../types';

import { BashExe } from './exeBash';

export const ExecutorFactory = (choice: ScriptDataType): IExecutor | undefined => {
  switch (choice.executor) {
    case ExecutorTypes.JS:
      return new JSExe();
    case ExecutorTypes.BASH:
      return new BashExe();
    default:
  }

  if (choice.internalPath) {
    if (choice.internalPath.endsWith('.js')) {
      return new JSExe();
    }
    if (choice.internalPath.endsWith('.sh') || choice.internalPath.endsWith('.bash')) {
      return new BashExe();
    }
  }

  return undefined;
};
