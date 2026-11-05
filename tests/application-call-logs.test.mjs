import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import {
  auditEventDefinitions,
  auditEvents,
  normalizeAudit
} from '../src/views/accounts/Integration/components/applicationAudit.js'

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
    auditEvents,
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
  const eventTypes = metadata.filters.event.choices.map(({ value }) => value)
  assert.equal(eventTypes.includes('credential_fetched'), false)
  assert.equal(eventTypes.includes('secret_change_finished'), false)
  for (const value of [
    'rotation_started',
    'secret_change_started',
    'secret_change_completed',
    'secret_change_failed',
    'application_failure_reviewed',
    'credential_confirmation_skipped'
  ])
    assert.ok(eventTypes.includes(value), `Missing current audit event: ${value}`)
  assert.equal(metadata.filters.id.type, 'uuid')
  assert.equal(metadata.filters.service.label, 'Application')
  assert.equal(metadata.actions.GET.id.type, 'uuid')
  assert.equal(metadata.search.fields[0].name, 'service')
  assert.deepEqual(metadata.ordering.default, ['-date_created'])
  assert.deepEqual(metadata.filters.event.operators, ['exact', 'in'])
})

test('retired audit event names remain readable in history without returning to the filter', () => {
  const row = normalizeAudit({ event: 'secret_change_finished' }, (key) => `translated:${key}`)
  assert.equal(row.event_display, 'translated:AppAuditSecretChangeFinished')
  assert.equal(Object.hasOwn(auditEvents, 'secret_change_finished'), false)
  assert.equal(
    normalizeAudit({ event: 'unknown_event' }, (key) => key).event_display,
    'unknown_event'
  )
})

test('audit details explain the same current event types offered in the filter', async () => {
  const zh = JSON.parse(
    await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
  )
  const t = (key) => zh[key]
  assert.equal(Object.keys(auditEvents).length, 28)
  for (const [event, definition] of Object.entries(auditEventDefinitions)) {
    const row = normalizeAudit({ event }, t)
    assert.ok(row.event_display, event)
    assert.ok(row.event_meaning, event)
    assert.deepEqual(row.related_protocol_events, definition.protocolEvents)
  }
  assert.equal(normalizeAudit({ event: 'command_result' }, t).event_display, '应用处理结果')
  assert.equal(
    normalizeAudit({ event: 'credential_confirmation_skipped' }, t).event_display,
    '跳过应用校验'
  )
  assert.equal(
    normalizeAudit({ event: 'application_failure_reviewed' }, t).event_display,
    '管理员确认继续'
  )
  assert.match(
    normalizeAudit({ event: 'credential_confirmed' }, t).event_meaning,
    /与事件回执和取密分开/
  )
  assert.match(
    normalizeAudit({ event: 'credential_confirmation_skipped' }, t).event_meaning,
    /不表示校验通过/
  )
  assert.match(
    normalizeAudit({ event: 'application_failure_reviewed' }, t).event_meaning,
    /保留原始失败/
  )
})

test('main integration tabs separate retrieval, protocol events and activities with existing permission', async () => {
  const integration = await component('../src/views/accounts/Integration/index.vue', {
    TabPage: null
  })
  const state = integration.data.call({ $t: (key) => key, $hasPerm: () => false })
  for (const [name, label] of [
    ['records', 'ApplicationCallLogs'],
    ['events', 'ApplicationEventLogs'],
    ['activities', 'ApplicationActivityLogs']
  ]) {
    const tab = state.tab.submenu.find((item) => item.name === name)
    assert.equal(tab.title, label)
    assert.equal(tab.hidden, true)
  }
})
