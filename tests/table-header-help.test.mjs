import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ElTooltip, ID_INJECTION_KEY } from 'element-plus'

const source = await readFile(
  process.env.TABLE_HELP_SOURCE ||
    new URL('../src/components/Table/AutoDataTable/utils.js', import.meta.url),
  'utf8'
)
const method = source.match(/  addHelpTipIfNeed\(col\) \{[\s\S]*?\n  \}/)[0]
const addHelpTipIfNeed = new Function(
  'h',
  'ElTooltip',
  'return ({' + method + '}).addHelpTipIfNeed'
)(h, ElTooltip)

test('table headers render the help icon through the Vue tooltip component', async () => {
  const col = addHelpTipIfNeed({ label: 'Status', helpTip: 'CPU load / Memory / Disk' })
  const app = createSSRApp({ render: () => col.renderHeader({ column: col }) })
  app.provide(ID_INJECTION_KEY, { prefix: 18049, current: 0 })
  const html = await renderToString(app)
  assert.match(html, /Status/)
  assert.match(html, /<i[^>]*fa-question-circle-o/)
  assert.doesNotMatch(html, /<el-tooltip/)
  const tooltip = col.renderHeader({ column: col }).children[1]
  assert.equal(tooltip.props.showAfter, 500)
})

test('columns without help keep their existing header renderer', () => {
  const renderHeader = () => h('strong', 'Name')
  const col = { label: 'Name', renderHeader }
  assert.equal(addHelpTipIfNeed(col), col)
  assert.equal(col.renderHeader, renderHeader)
})
