import os from 'os';
import fs from 'fs';
import path from 'path';
import { extractScriptData, getAllFilePathsInDirectory, getUUID, isScriptCompatible } from './utils';
import { ScriptDBType, ScriptDataPrintable, ScriptDataType } from '../types';
import { LoggerType, getLogger } from '../log';

import Table from 'easy-table';
import { TEMP_FOLDER_PATH, sleep } from '../utils';

const logger = getLogger({ prefix: 'scriptDB' });

/* Script Data example
# ---
# title: Remove Windows Worker
# description: Running several atomic scripts that would remove the Windows Service & Scheduled task
# requirements: User needs to be an admin
# category: worker | ssl
# system: windows | linux | darwin
# type: recipe | ingredient
# executor (optional) - this is determined through the file extension : bash | powershell | js
# internalPath (not for use) - (this is created when scanning the objects)
# ---
*/

class ScriptsDB {
  _tempDirForUser: string = TEMP_FOLDER_PATH;
  _db: ScriptDBType = {};
  _sources: string[] = [];

  constructor() {
    logger.info('Gathering DB sources...');
    logger.debug('NODE_ENV:', process.env['NODE_ENV']);
    if (process.env['NODE_ENV'] === 'development') {
      this._sources.push(path.join(__dirname, '..', '..', 'powershell'));
      this._sources.push(path.join(__dirname, '..', '..', 'bash'));
      this._sources.push(path.join(__dirname, '..', '..', 'recipes'));
      this._sources.push(path.join(__dirname, '..', '..', 'python'));
    } else {
      this._sources.push(path.join(__dirname, '..', '..', 'it-setup', 'powershell'));
      this._sources.push(path.join(__dirname, '..', '..', 'it-setup', 'bash'));
      this._sources.push(path.join(__dirname, '..', '..', 'it-setup', 'recipes'));
      this._sources.push(path.join(__dirname, '..', '..', 'it-setup', 'python'));
    }
    this._sources.push(this._tempDirForUser);
    logger.debug('Sources:', this._sources);

    // ! used only for debugging purposes
    // const allFilesInFridge: string[] = [];
    // getAllFilePathsInDirectory(path.join(__dirname, '..', '..', '..'), allFilesInFridge);
    // logger.debug('ALL Files:', allFilesInFridge);
  }

  walk = (sources?: string[]) => {
    // this._ensureSource();
    // get the current directory - this is where the executable is executing :)
    for (const source of sources || this._sources) {
      logger.info('Talking a walk in:', source);
      const allScripts: string[] = [];
      getAllFilePathsInDirectory(source, allScripts);

      logger.info('Gathering scripts data...');
      allScripts?.forEach((scriptPath) => {
        const fileBuffer = fs.readFileSync(scriptPath);
        const compatibleData = isScriptCompatible(fileBuffer.toString())?.[0];
        if (compatibleData) {
          logger.debug('Compatible data:', compatibleData);
          const scriptData = extractScriptData(scriptPath, compatibleData);
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

  isSupported = (path: string): boolean => {
    const data = this.get(path);
    if (data && data.os) {
      switch (os.platform()) {
        case 'win32':
          return data.os === 'windows';
        case 'darwin':
          return data.os === 'darwin';
        case 'linux':
          return data.os === 'linux';
      }
    }
    return true;
  };

  saveUserRecipe = (name: string, choices: (ScriptDataType | undefined)[], description?: string) => {
    const contents = `
// ---
// title: ${name}
// description: ${description ? description : ''}
// type: recipe
// executor: js
// ---

export const InnerSteps = [
${choices.map((choice) => (choice ? `${JSON.stringify(choice)},` : ''))}
]
    `;
    logger.debug('Saving:', name);
    const filePath = path.join(this._tempDirForUser, `${getUUID()}.js`);
    logger.debug('Saving to:', filePath);
    logger.debug('Directory alt:', process.cwd());
    logger.debug('Directory:', path.join(__dirname, '..', '..'));
    logger.debug('Directory contents:', fs.readdirSync(path.join(__dirname, '..', '..')));
    if (!fs.existsSync(this._tempDirForUser)) {
      fs.mkdirSync(this._tempDirForUser);
    }
    fs.writeFileSync(filePath, contents);

    this.walk([this._tempDirForUser]);
  };

  isUserRecipe = (choice: ScriptDataType) => choice.internalPath.startsWith(this._tempDirForUser);

  deleteUserRecipe = (choice: ScriptDataType) => {
    if (!this.isUserRecipe(choice)) {
      logger.warn("I'm sorry but you cannot delete internal recipes or ingredients");
      return;
    }

    logger.debug('Removing script:', choice.internalPath);
    if (this.has(choice.internalPath)) {
      delete this._db[choice.internalPath];
    }

    fs.rmSync(choice.internalPath, { force: true, maxRetries: 3, recursive: true, retryDelay: 1 });
    sleep(100);

    this.walk([this._tempDirForUser]);
  };

  getPrintableData = (data: ScriptDataType): ScriptDataPrintable => {
    return {
      title: data.title,
      category: data.category,
      description: data.description,
      executor: data.executor,
      os: data.os,
      type: data.type,
    };
  };

  getTableData = (
    data: (ScriptDataType | undefined)[] | ScriptDataType | (ScriptDataPrintable | undefined)[] | ScriptDataPrintable,
  ) => {
    return Table.print(data);
  };

  printInternalSteps = async (data: ScriptDataType, log?: LoggerType) => {
    if (data.internalSteps === undefined) {
      return;
    }
    const tempData = data.internalSteps.map((value, index) => {
      return value
        ? {
            step: `Step ${index + 1}`,
            title: value.title,
            description: value.description,
          }
        : undefined;
    });
    const dataToPlot = tempData.filter(
      (data): data is { step: string; title: string; description: string | undefined } => !!data,
    );

    const trueLog = log || logger;

    await trueLog.output('The internal steps:', () => {
      trueLog.info(scriptsDB.getTableData(dataToPlot));
    });
  };

  has = (path: string) => Object.keys(this._db).find((k: string) => k === path) !== undefined;

  get = (path: string) => (this.has(path) ? this._db[path] : undefined);

  isEmpty = () => Object.keys(this._db).length === 0;

  recipes = () =>
    Object.keys(this._db)
      .filter((k) => this._db[k].type !== undefined && this._db[k].type === 'recipe')
      .sort((a, b) => this._db[a].title.localeCompare(this._db[b].title));
  ingredients = () =>
    Object.keys(this._db)
      .filter((k) => this._db[k].type !== undefined && this._db[k].type === 'ingredient')
      .sort((a, b) => this._db[a].title.localeCompare(this._db[b].title));

  keys = () => Object.keys(this._db).sort((a, b) => this._db[a].title.localeCompare(this._db[b].title));
  values = () => Object.values(this._db).sort((a, b) => a.title.localeCompare(b.title));
  entries = () =>
    Object.entries(this._db).sort((a, b) => {
      const titleA = a[1].title;
      const titleB = b[1].title;
      return titleA.localeCompare(titleB);
    });
}

export const scriptsDB = new ScriptsDB();
