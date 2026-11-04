import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

test('One-sentence setup uses this site and preserves connection and authorization boundaries', async () => {
  const source = await readFile(new URL('../src/components/Apps/MCPConnectionGuide/index.vue', import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const component = new Function('IBox', 'copy', 'window', descriptor.script.content
    .replace(/^import .*$/gm, '').replace('export default', 'return'))({}, () => {}, { location: { origin: 'https://jumpserver.example:8443' } })
  for (const locale of ['en', 'zh']) {
    const strings = JSON.parse(await readFile(new URL(`../src/i18n/langs/${locale}.json`, import.meta.url), 'utf8'))
    const guide = { publicURL: 'https://assets.example/koko/mcp', settings: { MCP_ENABLED: true },
      $t: (key, values) => strings[key].replace(/\{(\w+)\}/g, (_, name) => values[name]) }
    const prompt = component.computed.agentSetupPrompt.call(guide)
    assert.ok(prompt.includes('https://jumpserver.example:8443/core/auth/agent/install.md'))
    assert.ok(prompt.includes(guide.publicURL))
    assert.ok(prompt.includes('Codex') && prompt.includes('DSH') && prompt.includes('OAuth'))
    assert.equal(component.computed.canConnect.call(guide), true)
    guide.settings.MCP_ENABLED = false
    assert.equal(component.computed.canConnect.call(guide), false)
  }
})
