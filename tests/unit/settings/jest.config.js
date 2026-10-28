const path = require('path')

module.exports = {
  ...require('../../../jest.config'),
  rootDir: path.resolve(__dirname, '../../..'),
  testMatch: ['**/tests/unit/settings/*.spec.js'],
  transform: { '[.]jsx?$': require.resolve('../security/babel-transformer.cjs') }
}
