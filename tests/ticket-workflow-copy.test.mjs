import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

const source = await readFile(
  new URL('../src/views/tickets/components/WorkflowPanel.vue', import.meta.url),
  'utf8'
)
const rule = parse(source).descriptor.template.content.match(
  /<div class="step-description hint">[\s\S]*?<\/div>/
)[0]
const render = new Function(
  'Vue',
  compile(rule, { mode: 'function', prefixIdentifiers: true }).code
)(Vue)
const messages = JSON.parse(
  await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
)

test('approval rules render one explanation and retain the actual quorum', async () => {
  for (const [strategy, required, expected] of [
    ['any', 1, '或签（一人通过）'],
    ['all', 5, '会签（全部通过）'],
    ['quorum', 3, '需 3 人通过']
  ]) {
    const app = Vue.createSSRApp({
      render,
      setup: () => ({
        node: { config: { strategy }, required }
      })
    })
    app.config.globalProperties.$t = (key, params) =>
      messages[key].replace('{count}', params?.count)
    const html = await renderToString(app)
    assert.equal(html.replace(/<[^>]*>/g, '').trim(), expected)
  }
})
