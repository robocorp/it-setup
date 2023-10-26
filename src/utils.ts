// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
