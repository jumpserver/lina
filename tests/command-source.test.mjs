import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { compileScript, parse } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import { transformSync } from 'esbuild'
import { createSSRApp, h } from 'vue'

const source = await readFile(
  new URL('../src/views/sessions/formatters/CommandSourceFormatter.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'command-source', inlineTemplate: true })
const { code } = transformSync(compiled.content, { loader: 'ts', format: 'cjs' })
const component = new Function('require', 'module', `${code}; return module.exports.default`)(
  createRequire(import.meta.url),
  { exports: {} }
)
const messages = JSON.parse(
  await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
)

test('command sources render AI, manual, and legacy records consistently', async () => {
  for (const [value, expected] of [
    ['ai', 'AI 助手'],
    [{ value: 'ai', label: 'AI Assistant' }, 'AI 助手'],
    ['manual', '手动执行'],
    [{ value: 'manual' }, '手动执行'],
    [undefined, '未知'],
    [null, '未知'],
    ['', '未知'],
    ['unknown', '未知']
  ]) {
    const app = createSSRApp(component, { row: { source: value } })
    app.config.globalProperties.$t = (key) => messages[key]
    app.component('ElTag', { render() { return h('span', this.$slots.default()) } })
    const html = await renderToString(app)
    assert.ok(html.includes(expected), `${JSON.stringify(value)} rendered ${html}`)
    if (expected === '未知') assert.ok(!html.includes('手动执行'))
  }
})
