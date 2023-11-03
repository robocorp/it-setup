import { ScriptDataType } from '../types';

import { ExecutorTypes, IExecutor } from './types';

import { JSExe } from './exeJS';
import { BashExe } from './exeBash';
import { PowerShellExe } from './exePowerShell';
import { getExecutorFromExt } from '../utils';
import { getLogger } from '../log';

const logger = getLogger({ force: true });

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

export const executeSet = async (choices: (ScriptDataType | undefined)[]) => {
  const runChoice = async (choice: ScriptDataType) => {
    logger.info();

    const exe = ExecutorFactory(choice);
    if (exe !== undefined && exe.run) {
      await exe.run(choice);
    } else {
      logger.error('ERROR - Could not execute script. Executor not found.');
    }
    logger.info();
  };

  for (const choice of choices) {
    if (!choice) {
      continue;
    }
    await runChoice(choice);
  }
};
