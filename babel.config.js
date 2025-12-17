module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    [
      '@vue/babel-plugin-jsx',
      {
        // Keep Vue 2-style v-model and onXXX handlers compatible where used
        transformOn: true,
        mergeProps: true
      }
    ]
  ]
}
