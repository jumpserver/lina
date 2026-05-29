module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        corejs: 3,
        modules: false,
        useBuiltIns: 'usage'
      }
    ]
  ],
  plugins: ['@babel/plugin-proposal-optional-chaining']
}
