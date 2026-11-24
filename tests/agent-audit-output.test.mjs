import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createMemoryHistory, createRouter } from 'vue-router'
import lodash from 'lodash'
import { evidenceOutput } from '../src/views/audits/AgentAudit/output.js'
import { agentAuditRoute } from '../src/views/audits/AgentAudit/routes.js'

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

async function auditRouter(permissions) {
  const source = await readFile(new URL('../src/router/audit/sessions.js', import.meta.url), 'utf8')
  const routes = new Function('i18n', 'empty', 'agentAuditRoute', source.replace(/^import .*$/gm, '').replace('export default', 'return'))({ t: key => key }, {}, agentAuditRoute)
  const checks = await readFile(new URL('../src/utils/jms/permission.js', import.meta.url), 'utf8')
  const check = new Function(checks.replace(/^import .*$/gm, '').replaceAll('export function', 'function') + '\nreturn checkPermission')()
  const permissionSource = await readFile(new URL('../src/store/modules/permission.js', import.meta.url), 'utf8')
  const filter = new Function('getResourceNameByPath', 'hasPermission', 'i18n', '_',
    permissionSource.slice(0, permissionSource.indexOf('const state =')).replace(/^import .*$/gm, '').replaceAll('export function', 'function') + '\nreturn filterPermedRoutes'
  )(value => value, required => check(required, permissions), { global: { t: value => value } }, lodash)
  const filtered = filter(routes, { meta: { level: 2, fullPath: '/audit/sessions', view: 'audit' } })
  const withoutLazyComponents = (items) => items.map(item => ({
    ...item,
    ...(item.component ? { component: {} } : {}),
    ...(item.children ? { children: withoutLazyComponents(item.children) } : {})
  }))
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/audit/sessions', children: withoutLazyComponents(filtered) }] })
  return { router, filtered }
}

test('Agent audit routes require their independent view permissions', async () => {
  for (const permissions of [[], ['terminal.view_agentsession'], ['terminal.view_agentaction'], ['terminal.view_session', 'terminal.view_command']]) {
    const { router } = await auditRouter(permissions)
    for (const resource of ['AgentSession', 'AgentAction']) {
      const allowed = permissions.includes(`terminal.view_${resource.toLowerCase()}`)
      assert.equal(router.hasRoute(`${resource}List`), allowed)
      assert.equal(router.hasRoute(`${resource}Detail`), allowed)
    }
    assert.equal(router.hasRoute('SessionList'), permissions.some(p => ['terminal.view_session', 'terminal.view_agentsession'].includes(p)))
    assert.equal(router.hasRoute('CommandList'), permissions.some(p => ['terminal.view_command', 'terminal.view_agentaction'].includes(p)))
    assert.equal(router.hasRoute('SessionDetail'), permissions.includes('terminal.view_session'))
  }
})

test('Authorized Agent routes preserve organization, filters and session actions navigation', async () => {
  const { router, filtered } = await auditRouter(['terminal.view_agentsession', 'terminal.view_agentaction'])
  for (const resource of ['AgentSession', 'AgentAction']) {
    assert.equal(router.hasRoute(`${resource}List`), true)
    const detail = router.resolve({ name: `${resource}Detail`, params: { id: 'record-id' }, query: { oid: 'organization-id' } })
    assert.equal(detail.params.id, 'record-id')
    assert.equal(detail.query.oid, 'organization-id')
    const kind = resource === 'AgentSession' ? 'sessions' : 'actions'
    await router.push(`/audit/sessions/agent-${kind}?oid=organization-id&search=needle`)
    assert.equal(router.currentRoute.value.name, kind === 'sessions' ? 'SessionList' : 'CommandList')
    assert.equal(router.currentRoute.value.query.tab, kind === 'sessions' ? 'AgentSessions' : 'AgentActions')
    assert.equal(router.currentRoute.value.query.oid, 'organization-id')
    assert.equal(router.currentRoute.value.query.search, 'needle')
    await router.push(detail)
    await router.push(agentAuditRoute(kind, undefined, 'organization-id'))
    assert.equal(router.currentRoute.value.query.tab, kind === 'sessions' ? 'AgentSessions' : 'AgentActions')
  }
  const scopedActions = agentAuditRoute('sessions', 'parent-session', 'organization-id', 'AgentActions')
  await router.push(scopedActions)
  assert.equal(router.currentRoute.value.name, 'AgentSessionDetail')
  assert.equal(router.currentRoute.value.params.id, 'parent-session')
  assert.equal(router.currentRoute.value.query.tab, 'AgentActions')
  assert.equal(router.currentRoute.value.query.oid, 'organization-id')
  assert.equal(router.hasRoute('SessionDetail'), false)
  assert.equal(filtered.filter(route => !route.hidden).length, 2)
})
