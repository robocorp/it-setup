import chalk from 'chalk';

type prop = { prefix?: string; force?: boolean };

type logType = 'info' | 'warn' | 'debug' | 'error';

export type LoggerType = {
  info: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  debug: (...data: any[]) => void;
  error: (...data: any[]) => void;
  trace: (...data: any[]) => void;
  output: (msg: string, inner: () => Promise<void> | void, type?: logType) => void;
};

export const getLogger = (p: prop): LoggerType => {
  return process.env['NODE_ENV'] === 'development' || p.force
    ? {
        info: (...data: any[]) =>
          p.prefix ? console.log(chalk.greenBright(p.prefix, '-', ...data)) : console.log(chalk.greenBright(...data)),
        warn: (...data: any[]) =>
          p.prefix ? console.log(chalk.yellowBright(p.prefix, '-', ...data)) : console.log(chalk.yellowBright(...data)),
        debug: (...data: any[]) =>
          p.prefix ? console.log(chalk.blueBright(p.prefix, '-', ...data)) : console.log(chalk.blueBright(...data)),
        error: (...data: any[]) =>
          p.prefix ? console.log(chalk.redBright(p.prefix, '-', ...data)) : console.log(chalk.redBright(...data)),
        trace: (...data: any[]) =>
          p.prefix ? console.log(chalk.redBright(p.prefix, '-', ...data)) : console.log(chalk.blackBright(...data)),
        output: async (msg: string, inner: () => Promise<void> | void, type?: logType) => {
          // debug is the default
          let chalkFunc = chalk.blueBright;
          switch (type) {
            case 'info':
              chalkFunc = chalk.greenBright;
              break;
            case 'warn':
              chalkFunc = chalk.yellowBright;
              break;
            case 'error':
              chalkFunc = chalk.redBright;
              break;
          }

          console.log();
          console.log(chalkFunc('---', msg));
          console.log(chalkFunc('-'.repeat(100)));
          await inner();
          console.log(chalkFunc('-'.repeat(100)));
          console.log();
        },
      }
    : {
        info: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {},
        trace: () => {},
        output: async () => {},
      };
};
