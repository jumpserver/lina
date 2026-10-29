import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createMemoryHistory, createRouter } from 'vue-router'
import lodash from 'lodash'
import { evidenceOutput } from '../src/views/audits/AgentAudit/output.js'

test('Agent output joins UTF-8 bytes split across evidence pages and separates stderr', () => {
  const bytes = Buffer.from('中文\n<script>alert(1)</script>')
  const events = [
    { payload: { stream: 'stdout', encoding: 'base64', data: bytes.subarray(0, 2).toString('base64') } },
    { payload: { stream: 'stderr', encoding: 'utf-8', data: 'error\n' } }
  ]
  assert.equal(evidenceOutput(events, false)[0].text, '')
  events.push({ payload: { stream: 'stdout', encoding: 'base64', data: bytes.subarray(2).toString('base64') } })
  assert.deepEqual(evidenceOutput(events), [
    { name: 'stdout', text: '中文\n<script>alert(1)</script>' },
    { name: 'stderr', text: 'error\n' }
  ])
})

test('Agent lists and details survive permission filtering and resolve with an organization', async () => {
  const source = await readFile(new URL('../src/router/audit/sessions.js', import.meta.url), 'utf8')
  const routes = new Function('i18n', 'empty', source.replace(/^import .*$/gm, '').replace('export default', 'return'))({ t: key => key }, {})
  const permissionSource = await readFile(new URL('../src/store/modules/permission.js', import.meta.url), 'utf8')
  const filter = new Function('getResourceNameByPath', 'hasPermission', 'i18n', '_',
    permissionSource.slice(0, permissionSource.indexOf('const state =')).replace(/^import .*$/gm, '').replaceAll('export function', 'function') + '\nreturn filterPermedRoutes'
  )(value => value, permissions => permissions.length === 0, { global: { t: value => value } }, lodash)
  const filtered = filter(routes, { meta: { level: 2, fullPath: '/audit/sessions', view: 'audit' } })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/audit/sessions', children: filtered }] })
  for (const resource of ['AgentSession', 'AgentAction']) {
    assert.equal(router.hasRoute(`${resource}List`), true)
    const detail = router.resolve({ name: `${resource}Detail`, params: { id: 'record-id' }, query: { oid: 'organization-id' } })
    assert.equal(detail.params.id, 'record-id')
    assert.equal(detail.query.oid, 'organization-id')
  }
})
