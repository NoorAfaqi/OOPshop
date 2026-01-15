module.exports = {
  timeout: 10000,
  recursive: true,
  exit: true,
  require: ['./__tests__/setup.js'],
  spec: ['__tests__/**/*.test.js'],
  reporter: 'spec',
  colors: true,
  bail: false,
};
