import path from 'path';
import os from 'os';
import { ConsoleParser, ProcessHandler } from '@robocorp/dev-tools-commons';

import { getLogger } from 'log4js';

const logger = getLogger('Executor');

export const resolveUserAppDataRoot = (): string | undefined => {
  switch (os.platform()) {
    case 'darwin':
    case 'linux':
      return path.resolve(`${os.homedir()}`);
    case 'win32':
      return path.resolve(`${process.env.LOCALAPPDATA}`);
    default:
      return undefined;
  }
};

export const userAppDataRoot: string | undefined = resolveUserAppDataRoot();

export const resolveRobocorpRoot = (): string | undefined => {
  switch (os.platform()) {
    case 'darwin':
    case 'linux':
      return userAppDataRoot ? path.resolve(`${userAppDataRoot}/.robocorp`) : undefined;
    case 'win32':
      return userAppDataRoot ? path.resolve(`${userAppDataRoot}/robocorp`) : undefined;
    default:
      return undefined;
  }
};

export const consoleParser = new ConsoleParser(logger);
export const processHandler = new ProcessHandler(resolveRobocorpRoot() || '', logger);
