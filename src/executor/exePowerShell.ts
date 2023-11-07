import { createSpinner } from 'nanospinner';
import { PowerShell } from '@robocorp/dev-tools-commons';

import { getLogger } from '../log';
import { ScriptDataType } from '../types';

import { ExecutorTypes, IExecutor } from './types';
import { sleep } from '../utils';

const logger = getLogger({ force: true });

export class PowerShellExe extends IExecutor {
  type = ExecutorTypes.POWERSHELL;

  run = async (choice: ScriptDataType | undefined) => {
    if (!choice) {
      logger.warn('Running choice is undefined');
      return;
    }
    logger.info();
    logger.info('Executing:', choice.title, '-', choice.description ? choice.description : 'No provided description');
    const spinner = createSpinner(`Running ${choice.type}: ${choice.title}`).start();

    const shell = new PowerShell.PowerShell();
    const header = 'POWERSHELL_RUN_' + choice.title.toUpperCase().replace(/\s/gi, '_');
    const result = await shell.runAsAdmin(header, choice.internalPath);

    logger.info();
    await logger.output('Console Output:', () => {
      logger.debug(result.io?.stdout);
    });

    if (result.error) {
      logger.error('--- ERROR:', result.error);
    }
    if (result.errorReason) {
      logger.error('--- ERROR REASON:', result.errorReason);
    }
    await logger.output(
      'ERROR log:',
      () => {
        logger.error(result.io?.stderr);
      },
      'error',
    );

    shell.destructor(true);

    await sleep(500);
    if (!result.error) {
      spinner.success({ text: `Finished with this ${choice.type}: ${choice.title}` });
    } else {
      spinner.error({ text: 'Sorry I was not able to execute your order.' });
    }
    await sleep(500);

    spinner.reset();
    spinner.clear();

    logger.info();
  };
}
