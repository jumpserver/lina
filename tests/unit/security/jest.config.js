const path = require('path')
module.exports = {
  ...require('../../../jest.config'),
  rootDir: path.resolve(__dirname, '../../..'),
  testMatch: ['**/tests/unit/security/*.spec.js'],
  transform: { '[.]jsx?$': require.resolve('./babel-transformer.cjs') }
}
