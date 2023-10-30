import { getLogger } from '../log';
import { ScriptDataType } from '../types';
import { ExecutorFactory } from './exeFactory';

import { ExecutorTypes } from './types';

const logger = getLogger({ force: true });

export class JSExe {
  type = ExecutorTypes.JS;

  run = async (choice: ScriptDataType) => {
    logger.info();
    logger.info(
      'Executing script:',
      choice.title,
      '-',
      choice.description ? choice.description : 'No provided description',
    );
    logger.info('- script is most likely a user saved recipe');
    logger.info('- will proceed with each saved step in order');

    if (choice.internalSteps && choice.internalSteps.length > 0) {
      for (const step of choice.internalSteps) {
        const exe = ExecutorFactory(step);
        if (exe !== undefined && exe.run) {
          await exe.run(step);
        }
      }
    } else {
      logger.error('ERROR: There are no internal steps mentioned. Probably faulty recipe.');
    }
    logger.info();
  };
}
