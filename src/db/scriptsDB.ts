import os from 'os';
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
  _sources: string[] = [];

  constructor() {
    logger.debug('NODE_ENV:', process.env['NODE_ENV']);
    logger.debug('SOURCE DEV:', __dirname);
    logger.debug('SOURCE PRD:', path.join(__dirname, '../'));
    if (process.env['NODE_ENV'] === 'development') {
      this._sources.push(path.join(__dirname, '..', '..', 'powershell'));
      this._sources.push(path.join(__dirname, '..', '..', 'bash'));
    } else {
      this._sources.push(path.join(__dirname, '..', '..', 'powershell'));
      this._sources.push(path.join(__dirname, '..', '..', 'bash'));
    }
  }

  walk = () => {
    // this._ensureSource();
    // get the current directory - this is where the executable is executing :)
    for (const source of this._sources) {
      logger.info('Talking a walk in:', source);
      const allScripts: string[] = [];
      getAllFilePathsInDirectory(source, allScripts);

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
    }

    logger.warn('Script DB is:', JSON.stringify(scriptsDB, undefined, 4));
  };

  isSupported = (k: string): boolean => {
    const data = this.get(k);
    if (data.os) {
      switch (os.platform()) {
        case 'win32':
          return data.os === 'windows';
        case 'darwin':
          return data.os === 'darwin';
        case 'linux':
          return data.os === 'linux';
      }
    }
    return false;
  };

  isEmpty = () => Object.keys(this._db).length === 0;

  get = (k: string) => this._db[k];

  recipes = () => Object.keys(this._db).filter((k) => this._db[k].type !== undefined && this._db[k].type === 'recipe');
  ingredients = () =>
    Object.keys(this._db).filter((k) => this._db[k].type !== undefined && this._db[k].type === 'ingredient');

  keys = () => Object.keys(this._db);
  values = () => Object.values(this._db);
  entries = () => Object.entries(this._db);
}

export const scriptsDB = new ScriptsDB();
