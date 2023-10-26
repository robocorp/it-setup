import chalk from 'chalk';

type prop = { prefix?: string };

export const getLogger = (
  p: prop,
): {
  info: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  debug: (...data: any[]) => void;
  error: (...data: any[]) => void;
} => {
  return process.env['NODE_ENV'] === 'development'
    ? {
        info: (...data: any[]) => console.log(chalk.greenBright(p.prefix ? `${p.prefix}:` : undefined, ...data)),
        warn: (...data: any[]) => console.log(chalk.yellowBright(p.prefix ? `${p.prefix}:` : undefined, ...data)),
        debug: (...data: any[]) => console.log(chalk.blueBright(p.prefix ? `${p.prefix}:` : undefined, ...data)),
        error: (...data: any[]) => console.log(chalk.redBright(p.prefix ? `${p.prefix}:` : undefined, ...data)),
      }
    : {
        info: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {},
      };
};
