import chalk from 'chalk';

type prop = { prefix?: string; force?: boolean };

export const getLogger = (
  p: prop,
): {
  info: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  debug: (...data: any[]) => void;
  error: (...data: any[]) => void;
} => {
  return process.env['NODE_ENV'] === 'development' || p.force
    ? {
        info: (...data: any[]) =>
          p.prefix ? console.log(chalk.greenBright(p.prefix, ...data)) : console.log(chalk.greenBright(...data)),
        warn: (...data: any[]) =>
          p.prefix ? console.log(chalk.yellowBright(p.prefix, ...data)) : console.log(chalk.yellowBright(...data)),
        debug: (...data: any[]) =>
          p.prefix ? console.log(chalk.blueBright(p.prefix, ...data)) : console.log(chalk.blueBright(...data)),
        error: (...data: any[]) =>
          p.prefix ? console.log(chalk.redBright(p.prefix, ...data)) : console.log(chalk.redBright(...data)),
      }
    : {
        info: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {},
      };
};
