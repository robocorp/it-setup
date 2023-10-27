import { ConsoleParser } from '@robocorp/dev-tools-commons';
import { Executor, processHandler } from './executor';
import { createSpinner } from 'nanospinner';

import { getLogger } from '../log';
import { ScriptDataType } from '../types';
import { sleep } from '../utils';

const logger = getLogger({ force: true });

export class BashExe extends Executor {
  bin = 'bash';

  run = async (path: string, choice: ScriptDataType) => {
    logger.info('Executing script:', choice.title);
    const spinner = createSpinner(`Running ${choice.type}`).start();

    const consoleParser = new ConsoleParser();
    const cmd = `${this.bin} ${path}`;
    const proc = await processHandler.spawn(cmd, 'BASH_RUN', { consoleParser });
    if (proc.error) {
      logger.error(`Demo worker unlinking failed: ${proc.error}`);
      logger.error(`Error log: ${consoleParser.stderr}`);
      spinner.error({ text: 'Sorry I was not able to execute your order.' });
    }
    logger.info();
    logger.info('Console Output:');
    logger.debug(consoleParser.stdout);
    logger.info('-'.repeat(100));

    await sleep(500);
    spinner.success({ text: `Finished with this ${choice.type}: ${choice.title}. Another?` });
    await sleep(500);
    spinner.reset();
    spinner.clear();

    logger.info();
  };
}
