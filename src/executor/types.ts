import { ScriptDataType } from '../types';

// ! This needs to be updated if a new Executor is added
export enum ExecutorTypes {
  JS = 'javascript',
  BASH = 'bash',
  POWERSHELL = 'powershell',
}

export class IExecutor {
  type: ExecutorTypes | undefined;
  run: ((choice: ScriptDataType) => Promise<void>) | undefined;
}
