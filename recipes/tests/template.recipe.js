// ---
// title: Template (JS) - First recipe as a combination
// description: Recipe template to show you can build simple recipes
// type: recipe
// executor: js
// category: Template
// os: darwin
// ---

module.exports = {
  InnerSteps: [
    {
      title: 'Echo 1',
      internalPath: './bash/tests/echo1.sh',
      description: 'Just echoing...',
      os: 'darwin',
      type: 'ingredient',
    },
    {
      title: 'Echo 2',
      internalPath: './bash/tests/echo2.sh',
      description: 'Just echoing...',
      os: 'darwin',
      type: 'ingredient',
    },
    {
      title: 'Echo 3',
      internalPath: './bash/tests/echo3.sh',
      description: 'Just echoing...',
      os: 'darwin',
      type: 'ingredient',
    },
    {
      title: 'Echo Fail',
      internalPath: './bash/tests/echo4.fail.sh',
      description: 'Echoing and failing',
      os: 'darwin',
      type: 'ingredient',
    },
  ],
};
