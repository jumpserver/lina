import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL(
    '../src/views/accounts/Integration/AccountRotationDetail/CredentialEventBrowser.vue',
    import.meta.url
  ),
  'utf8'
)
const { descriptor } = parse(source)
const script = descriptor.script.content
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace('export default', 'return')

function cycle(id, status = 'success') {
  return {
    id,
    status,
    events: [
      { id: `${id}-start`, recipients: [] },
      { id: `${id}-end`, recipients: [] }
    ]
  }
}

function viewFor(api, initialCycleId = '') {
  const component = new Function(
    'ListTable',
    'IBox',
    'ActionsFormatter',
    'DateFormatter',
    'DetailFormatter',
    'TagChoicesFormatter',
    'request',
    'credentialUrl',
    'getCredentialEventCycles',
    'toSafeLocalDateStr',
    'subscribedAccountLabel',
    'eventLabels',
    'statusLabels',
    'receiptStatus',
    script
  )(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    '/policies/',
    api,
    (v) => v,
    (v) => v,
    {},
    {},
    () => ''
  )
  const emitted = []
  const view = {
    latest: true,
    credentialId: 'policy',
    initialCycleId,
    initialClient: null,
    $t: (key) => key,
    $emit: (...args) => emitted.push(args)
  }
  Object.assign(view, component.data.call(view))
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  view.scheduleObservationRefresh = () => {}
  return { view, emitted, unmount: () => component.beforeUnmount.call(view) }
}

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

test('latest run displays an active cycle directly even when a newer standalone event exists', async () => {
  const requests = []
  const { view } = viewFor(async (id, params) => {
    requests.push(params)
    return params.cycle_id
      ? cycle(params.cycle_id, 'running')
      : {
          current_cycle: { id: 'active' },
          results: [{ id: 'newer-notification' }]
        }
  })
  await view.loadLatestCycle()
  assert.equal(view.detail.id, 'active')
  assert.equal(view.drawerVisible, false)
  assert.deepEqual(requests, [{ limit: 1 }, { cycle_id: 'active' }])
})

test('the last completed result remains visible after the active cycle finishes', async () => {
  const { view } = viewFor(async (_, params) =>
    params.cycle_id
      ? cycle(params.cycle_id)
      : { current_cycle: null, results: [{ id: 'completed' }] }
  )
  await view.loadLatestCycle()
  assert.equal(view.detail.id, 'completed')
  assert.equal(view.detail.status, 'success')
  assert.equal(view.detailLoading, false)
})

test('a policy without retained history shows an empty state without requesting a detail', async () => {
  let calls = 0
  const { view } = viewFor(async () => {
    calls++
    return { current_cycle: null, results: [] }
  })
  await view.loadLatestCycle()
  assert.equal(calls, 1)
  assert.equal(view.detail, null)
  assert.equal(view.cycleId, '')
  assert.equal(view.detailFailed, false)
  assert.equal(view.detailLoading, false)
})

test('a newly started cycle is targeted once and later refreshes follow the latest cycle', async () => {
  let newest = 'old'
  const { view, emitted } = viewFor(
    async (_, params) =>
      params.cycle_id ? cycle(params.cycle_id) : { current_cycle: null, results: [{ id: newest }] },
    'started'
  )
  await view.loadLatestCycle()
  assert.equal(view.detail.id, 'started')
  assert.deepEqual(emitted, [['cycle-opened']])
  newest = 'external-new-cycle'
  await view.loadLatestCycle({ silent: true })
  assert.equal(view.detail.id, 'external-new-cycle')
})

test('a stale directory response cannot replace a newer refresh', async () => {
  const slow = deferred()
  let count = 0
  const { view } = viewFor(async (_, params) => {
    if (params.cycle_id) return cycle(params.cycle_id)
    if (++count === 1) return slow.promise
    return { current_cycle: null, results: [{ id: 'new' }] }
  })
  const previous = view.loadLatestCycle()
  await view.loadLatestCycle()
  slow.resolve({ current_cycle: null, results: [{ id: 'old' }] })
  await previous
  assert.equal(view.detail.id, 'new')
})

test('leaving the tab discards outstanding requests', async () => {
  const pending = deferred()
  const { view, unmount } = viewFor(() => pending.promise)
  const request = view.loadLatestCycle()
  unmount()
  pending.resolve({ current_cycle: null, results: [{ id: 'old-policy' }] })
  await request
  assert.equal(view.detail, null)
})

test('background refresh preserves the selected event and receipt filter, including on transient failure', async () => {
  let fail = false
  const { view } = viewFor(async (_, params) => {
    if (fail) throw new Error('temporarily unavailable')
    return params.cycle_id
      ? cycle(params.cycle_id)
      : { current_cycle: null, results: [{ id: 'last' }] }
  })
  await view.loadLatestCycle()
  view.selectedEventId = 'last-start'
  view.receiptFilter = 'pending'
  await view.loadLatestCycle({ silent: true })
  assert.equal(view.selectedEventId, 'last-start')
  assert.equal(view.receiptFilter, 'pending')
  fail = true
  await view.loadLatestCycle({ silent: true })
  assert.equal(view.detail.id, 'last')
  assert.equal(view.detailFailed, false)
})
