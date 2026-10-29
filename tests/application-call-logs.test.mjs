import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

async function component(path, bindings) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*\n/gm, '')
    .replace('export default', 'return')
  return new Function(...Object.keys(bindings), script)(...Object.values(bindings))
}
const callLog = await component(
  '../src/views/accounts/Integration/components/ApplicationCallLog.vue',
  {
    ListTable: null,
    TagChoicesFormatter: null,
    toSafeLocalDateStr: (value) => value
  }
)
const eventLog = await component(
  '../src/views/accounts/Integration/components/ApplicationAudit.vue',
  {
    ListTable: null,
    Drawer: null,
    DetailFormatter: null,
    TagChoicesFormatter: null,
    toSafeLocalDateStr: (value) => value,
    request: null,
    ApplicationAuditDetail: null,
    auditEvents: { credential_fetched: 'Fetch', rotation_started: 'Rotation' },
    auditResults: {},
    resultTagTypes: {},
    normalizeAudit: (value) => value
  }
)
const view = (id = '') => ({
  object: { id },
  credential: {},
  $t: (key) => key,
  $store: {
    dispatch: async () => ({
      actions: { GET: { id: { type: 'uuid' } } },
      filters: {
        id: { type: 'uuid', label: 'ID' },
        service: { type: 'string', label: 'Application' }
      },
      search: { fields: [{ name: 'service', label: 'Application' }] },
      ordering: { default: ['-date_created'] }
    })
  }
})

test('application call records use the legacy endpoint and scope by service_id', () => {
  const table = callLog.computed.tableConfig.call(view('application'))
  assert.equal(table.url, '/api/v1/audits/service-access-logs/')
  assert.deepEqual(table.extraQuery, { service_id: 'application' })
  assert.deepEqual(callLog.computed.tableConfig.call(view()).extraQuery, {})
  const source = table.columns.find(({ prop }) => prop === 'source')
  assert.equal(source.formatter({ source: '' }), '-')
  assert.equal(source.formatter({ source: 'Agent' }), 'AgentAccess')
  assert.ok(table.columns.some(({ prop }) => prop === 'id'))
  assert.ok(table.columns.some(({ prop }) => prop === 'service_id'))
})

test('event requests exclude fetches without losing the application scope', async () => {
  const table = eventLog.computed.tableConfig.call(view('application'))
  assert.deepEqual(table.extraQuery, {
    application: 'application',
    exclude_event: 'credential_fetched'
  })
  const metadata = await eventLog.methods.getMetadata.call(view())
  assert.deepEqual(metadata.filters.event.choices, [
    { value: 'rotation_started', label: 'Rotation' }
  ])
  assert.equal(metadata.filters.id.type, 'uuid')
  assert.equal(metadata.filters.service.label, 'Application')
  assert.equal(metadata.actions.GET.id.type, 'uuid')
  assert.equal(metadata.search.fields[0].name, 'service')
  assert.deepEqual(metadata.ordering.default, ['-date_created'])
  assert.deepEqual(metadata.filters.event.operators, ['exact', 'in'])
})

test('main integration tabs expose separate call and event records with existing permission', async () => {
  const integration = await component('../src/views/accounts/Integration/index.vue', {
    TabPage: null
  })
  const state = integration.data.call({ $t: (key) => key, $hasPerm: () => false })
  for (const [name, label] of [
    ['records', 'ApplicationCallLogs'],
    ['events', 'ApplicationEventLogs']
  ]) {
    const tab = state.tab.submenu.find((item) => item.name === name)
    assert.equal(tab.title, label)
    assert.equal(tab.hidden, true)
  }
})
