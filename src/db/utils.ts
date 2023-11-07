/* eslint-disable no-useless-escape */
/* eslint-disable no-sparse-arrays */
import fs from 'fs';
import path from 'path';

import { getLogger } from '../log';
const logger = getLogger({ prefix: 'utils' });

import { ExecutorTypes } from '../executor';
import { ScriptCategory, ScriptDataType, ScriptOS, ScriptType } from '../types';
import { getExecutorFromExt } from '../utils';

export const getAllFilePathsInDirectory = (dirPath: string, fileArray?: string[]): string[] | undefined => {
  if (fs.existsSync(dirPath)) {
    logger.debug('Walking in:', dirPath);
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // If it's a directory, recursively search it
        fileArray = getAllFilePathsInDirectory(filePath, fileArray);
      } else {
        logger.debug('Walking passed:', file);

        // If it's a file, add its full path to the array
        fileArray?.push(filePath);
      }
    }
  } else {
    logger.error('Path not found:', dirPath);
  }

  return fileArray;
};

export const isScriptCompatible = (data: string) => data.match(/^[#\/]{1,2} ---\n(.*)^[#\/]{1,2} ---/gms);

export const extractScriptData = (path: string, data: string): ScriptDataType | undefined => {
  logger.debug('Creating extraction patterns...');
  const getTitle = (data: string) => /^[#\/]{1,2} title: (.*?)\n/gim.exec(data);
  const getDescription = (data: string) => /^[#\/]{1,2} description: (.*?)\n/gim.exec(data);
  const getRequirements = (data: string) => /^[#\/]{1,2} requirements: (.*?)\n/gim.exec(data);
  const getOS = (data: string) => /^[#\/]{1,2} os: (.*?)\n/gm.exec(data);
  const getCategory = (data: string) => /^[#\/]{1,2} category: (.*?)\n/gm.exec(data);
  const getType = (data: string) => /^[#\/]{1,2} type: (.*?)\n/gm.exec(data);
  const getExecutor = (data: string) => /^[#\/]{1,2} executor: (.*?)\n/gm.exec(data);

  const [, title] = getTitle(data) || [, undefined];

  if (!title) {
    logger.warn('Script has no title. Will skip:', path);
    return undefined;
  }

  let internalSteps = undefined;
  try {
    logger.debug('Checking if user saved recipe:', path);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const script = require(path);
    logger.debug('Require is ok:', JSON.stringify(script));
    if (Array.from(script.InnerSteps).length !== 0) {
      internalSteps = Array.from(script.InnerSteps).filter((step) => step !== undefined && step !== null);
    }
  } catch (e) {
    logger.warn('Requiring script failed:', e);
  }

  let executorDef: ExecutorTypes | undefined = (getExecutor(data) || [, undefined])[1] as ExecutorTypes;
  if (executorDef === undefined) {
    executorDef = getExecutorFromExt(path);
  }

  return {
    title: title,
    description: (getDescription(data) || [, undefined])[1],
    requirements: (getRequirements(data) || [, undefined])[1],
    os: (getOS(data) || [, undefined])[1] as ScriptOS,
    category: (getCategory(data) || [, undefined])[1] as ScriptCategory,
    type: (getType(data) || [, undefined])[1] as ScriptType,
    executor: executorDef,
    internalPath: path,
    internalSteps: internalSteps as ScriptDataType[],
  };
};

// getUUID - generates a unique UUID based on numbers & safe for path use
// examples: 1933-16-98-31-39-23-84-4-9219-9122 | 8309-16-98-31-39-23-84-7-9935-3674
export const getUUID = (): string => {
  const prefix = `${Math.floor(Math.random() * 9000) + 1000}`; // this creates a 4 digit number
  const middle = `${Date.now()}`.replace(/(.{2})/g, '$1-'); // this will split the number up into groups of two or one
  const suffixX = `${Math.floor(Math.random() * 9000) + 1000}`; // this creates a 4 digit number
  const suffixY = `${Math.floor(Math.random() * 9000) + 1000}`; // this creates a 4 digit number

  return `${prefix}-${middle}-${suffixX}-${suffixY}`;
};
