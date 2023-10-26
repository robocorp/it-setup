import fs from 'fs';
import path from 'path';
import { extractScriptData, getAllFilePathsInDirectory, isScriptCompatible } from './utils';
import { ScriptDBType } from '../types';
import { getLogger } from '../log';

const logger = getLogger({ prefix: 'scriptDB' });

/* Script Data example
# ---
# title: Remove Windows Worker
# description: Running several atomic scripts that would remove the Windows Service & Scheduled task
# requirements: User needs to be an admin
# category: Worker
# system: windows
# type: recipe
# ---
*/

class ScriptsDB {
  _db: ScriptDBType = {};
  _source: string = '';

  constructor() {
    logger.debug('NODE_ENV:', process.env['NODE_ENV']);
    logger.debug('SOURCE DEV:', __dirname);
    logger.debug('SOURCE PRD:', path.join(__dirname, '../'));
    this._source =
      process.env['NODE_ENV'] === 'development'
        ? path.join(__dirname, '..', '..', 'powershell')
        : path.join(__dirname, '../');
  }

  walk = () => {
    // this._ensureSource();
    // get the current directory - this is where the executable is executing :)
    logger.info('Talking a walk in:', this._source);
    const allScripts: string[] = [];
    getAllFilePathsInDirectory(this._source, allScripts);

    logger.info('Gathering scripts data...');
    allScripts?.forEach((scriptPath) => {
      const fileBuffer = fs.readFileSync(scriptPath);
      const isCompatibleData = isScriptCompatible(fileBuffer.toString())?.[0];
      logger.debug('Compatible data:', isCompatibleData);
      if (isCompatibleData) {
        const scriptData = extractScriptData(isCompatibleData);
        if (scriptData) {
          this._db[scriptPath] = scriptData;
        } else {
          logger.error('Template did not match:', scriptPath);
        }
      } else {
        logger.error('Script found incompatible with template:', scriptPath);
      }
    });

    logger.warn('Script DB is:', JSON.stringify(scriptsDB, undefined, 4));
  };

  isEmpty = () => Object.keys(this._db).length === 0;

  recipes = () => Object.keys(this._db).filter((k) => this._db[k].type !== undefined && this._db[k].type === 'recipe');

  get = (k: string) => this._db[k];

  at = (i: number) => this._db[i];
}

export const scriptsDB = new ScriptsDB();
