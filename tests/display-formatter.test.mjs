import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { compileTemplate, parse } from '@vue/compiler-sfc'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { transformSync } from 'esbuild'

const directory = new URL('../src/components/Table/TableFormatters/', import.meta.url)
const base = parse(await readFile(new URL('base.vue', directory), 'utf8')).descriptor
const source = parse(await readFile(new URL('DisplayFormatter.vue', directory), 'utf8')).descriptor
const baseFormatter = new Function(base.script.content.replace('export default', 'return'))()
const formatter = new Function(
  'BaseFormatter',
  source.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)(baseFormatter)
const template = compileTemplate({ source: source.template.content, filename: 'DisplayFormatter.vue', id: 'display-formatter-test' })
assert.deepEqual(template.errors, [])
const module = { exports: {} }
new Function('module', 'exports', 'require', transformSync(template.code, { format: 'cjs' }).code)(
  module, module.exports, createRequire(import.meta.url)
)

test('choice cells render labels, raw values and explicit display fields in Vue 3', async () => {
  const component = { ...formatter, render: module.exports.render }
  const render = (row, formatterArgs = {}) => renderToString(createSSRApp({
    render: () => h(component, { row, col: { prop: 'status', formatterArgs }, cellValue: row.status })
  }))
  assert.match(await render({ status: 'running', status_display: 'Running' }), />Running<\/span>/)
  assert.match(await render({ status: 'queued' }), />queued<\/span>/)
  assert.match(await render({ status: 'running', label: 'Custom' }, { displayKey: 'label' }), />Custom<\/span>/)
})
