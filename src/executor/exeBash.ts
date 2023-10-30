import { ConsoleParser } from '@robocorp/dev-tools-commons';
import { createSpinner } from 'nanospinner';

import { getLogger } from '../log';
import { ScriptDataType } from '../types';
import { sleep } from '../utils';

import { ExecutorTypes, IExecutor } from './types';
import { processHandler } from './utils';

const logger = getLogger({ force: true });

export class BashExe extends IExecutor {
  type = ExecutorTypes.BASH;

  bin = 'bash';

  run = async (choice: ScriptDataType | undefined) => {
    if (!choice) {
      logger.warn('Running choice is undefined');
      return;
    }
    logger.info();
    logger.info('Executing:', choice.title, '-', choice.description ? choice.description : 'No provided description');
    const spinner = createSpinner(`Running ${choice.type}: ${choice.title}`).start();

    const consoleParser = new ConsoleParser();
    const cmd = `${this.bin} ${choice.internalPath}`;
    const proc = await processHandler.spawn(cmd, 'BASH_RUN', { consoleParser });

    logger.output('Console Output:', () => {
      logger.debug(consoleParser.stdout);
    });

    if (proc.error || proc.code !== 0) {
      if (proc.error) {
        logger.error('ERROR: Bash script failed with proc error:', proc.error);
      }
      if (proc.code && proc.code !== 0) {
        logger.error('ERROR: Bash script failed with proc.code:', proc.code);
      }

      logger.output(
        'ERROR log:',
        () => {
          logger.error(consoleParser.stderr);
        },
        'error',
      );

      await sleep(500);
      spinner.error({ text: 'Sorry I was not able to execute your order.' });
      await sleep(500);
    } else {
      await sleep(500);
      spinner.success({ text: `Finished with this ${choice.type}: ${choice.title}` });
      await sleep(500);
    }

    spinner.reset();
    spinner.clear();

    logger.info();
  };
}
