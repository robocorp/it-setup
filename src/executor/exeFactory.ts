import { ScriptDataType } from '../types';

import { ExecutorTypes, IExecutor } from './types';

import { JSExe } from './exeJS';
import { BashExe } from './exeBash';
import { PowerShellExe } from './exePowerShell';
import { getExecutorFromExt } from '../utils';

export const ExecutorFactory = (choice: ScriptDataType): IExecutor | undefined => {
  switch (choice.executor) {
    case ExecutorTypes.JS:
      return new JSExe();
    case ExecutorTypes.BASH:
      return new BashExe();
    case ExecutorTypes.POWERSHELL:
      return new PowerShellExe();
    default:
  }

  switch (getExecutorFromExt(choice.internalPath)) {
    case ExecutorTypes.JS:
      return new JSExe();
    case ExecutorTypes.BASH:
      return new BashExe();
    case ExecutorTypes.POWERSHELL:
      return new PowerShellExe();
    default:
      break;
  }

  return undefined;
};
