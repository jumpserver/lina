let themeOptions = {}
const optionFiles = require.context('./themeConfigs', false, /\.js$/)

optionFiles.keys().forEach(item => {
  const config = optionFiles(item).default || optionFiles(item)
  themeOptions = { ...themeOptions, ...config }
})

export default themeOptions
