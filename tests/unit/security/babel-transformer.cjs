module.exports = {
  process(source, filename) {
    return require('@babel/core').transformSync(source, {
      filename,
      configFile: false,
      babelrc: false,
      presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' }, modules: 'commonjs' }]],
      plugins: [require.resolve('babel-plugin-jest-hoist')]
    }).code
  }
}
