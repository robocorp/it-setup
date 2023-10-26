export type ScriptOS = 'windows' | 'linux' | 'darwin';

export type ScriptCategory = 'worker' | 'ssl';

export type ScriptType = 'recipe' | 'ingredient';

export type ScriptDataType = {
  title: string;
  description?: string;
  requirements?: string;
  os?: ScriptOS;
  category?: ScriptCategory;
  type?: ScriptType;
};

export type ScriptDBType = {
  [pathToScript: string]: ScriptDataType;
};
