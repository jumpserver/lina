const { run } = require('runjs')
const rawArgv = process.argv.slice(2)
const args = rawArgv.filter(arg => arg !== '--preview' && arg !== '--report').join(' ')
const publicPath = '/ui/'
const outputDir = './lina'

if (process.env.npm_config_preview || rawArgv.includes('--preview')) {
  const report = rawArgv.includes('--report')

  run(`webpack --mode production --env mode=production ${args}`)

  const port = 9526

  var connect = require('connect')
  var serveStatic = require('serve-static')
  const app = connect()

  app.use(
    publicPath,
    serveStatic(outputDir, {
      index: ['index.html', '/']
    })
  )

  app.listen(port, function () {
    // debug(chalk.green(`> Preview at  http://localhost:${port}${publicPath}`))
    if (report) {
      // debug(chalk.green(`> Report at  http://localhost:${port}${publicPath}report.html`))
    }
  })
} else {
  run(`webpack --mode production --env mode=production ${args}`)
}
