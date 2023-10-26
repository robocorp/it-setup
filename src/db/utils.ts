import { getLogger } from '../log';
import { ScriptCategory, ScriptDataType, ScriptOS, ScriptType } from '../types';
import fs from 'fs';
import path from 'path';

const logger = getLogger({ prefix: 'utils' });

export const getAllFilePathsInDirectory = (dirPath: string, fileArray?: string[]): string[] | undefined => {
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

  return fileArray;
};

export const isScriptCompatible = (data: string) => data.match(/^# ---\n(.*)^# ---/gms);

export const extractScriptData = (data: string): ScriptDataType | undefined => {
  const getTitle = (data: string) => /^# title: (.*?)\n/gim.exec(data);
  const getDescription = (data: string) => /^# description: (.*?)\n/gim.exec(data);
  const getRequirements = (data: string) => /^# requirements: (.*?)\n/gim.exec(data);
  const getOS = (data: string) => /^# os: (.*?)\n/gm.exec(data);
  const getCategory = (data: string) => /^# category: (.*?)\n/gm.exec(data);
  const getType = (data: string) => /^# type: (.*?)\n/gm.exec(data);

  const [, title] = getTitle(data) || [, undefined];

  if (!title) {
    return undefined;
  }

  return {
    title: title,
    description: (getDescription(data) || [, undefined])[1],
    requirements: (getRequirements(data) || [, undefined])[1],
    os: (getOS(data) || [, undefined])[1] as ScriptOS,
    category: (getCategory(data) || [, undefined])[1] as ScriptCategory,
    type: (getType(data) || [, undefined])[1] as ScriptType,
  };
};
