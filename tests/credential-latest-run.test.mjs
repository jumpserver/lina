import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import {
  rotationEventTitle,
  buildCycleEventTimeline
} from '../src/views/accounts/Integration/AccountRotationDetail/rotationEventTimeline.js'

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
    'rotationEventTitle',
    'buildCycleEventTimeline',
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
    () => '',
    rotationEventTitle,
    buildCycleEventTimeline
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
  Object.defineProperty(view, 'stages', { get: () => component.computed.stages.call(view) })
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  view.scheduleObservationRefresh = () => {}
  return {
    view,
    emitted,
    stages: () => component.computed.stages.call(view),
    timeline: () => component.computed.timelineEvents.call(view),
    unmount: () => component.beforeUnmount.call(view)
  }
}

test('skipped verification is shown explicitly in the rotation stages', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = {
    kind: 'rotation',
    status: 'running',
    events: [{ id: 'skip', event: 'rotation.verify.skipped' }]
  }
  assert.equal(stages()[0].label, 'RotationVerificationSkippedEvent')
  assert.equal(stages()[0].event.id, 'skip')
  assert.equal(stages()[0].skipped, false)
})

function rotationWithProgress(phase, ready = false) {
  return {
    kind: 'rotation',
    status: 'running',
    rotation_status: { credential_status: 'waiting_switch', rotation_phase: phase },
    source_traffic: { ready },
    events: [
      {
        id: 'publish',
        event: 'credential.switch.published',
        revision: 6,
        recipient_count: 1,
        received_count: 1,
        confirmed_count: 0
      },
      { id: 'wait', event: 'rotation.waiting_for_app', revision: 6, received_count: 1 },
      { id: 'observe', event: 'rotation.source.waiting', revision: 6, received_count: 1 }
    ]
  }
}

test('timeline fills published history but stops the traversed line at unconfirmed switching', () => {
  const { view, timeline } = viewFor(async () => ({}))
  view.detail = { ...rotationWithProgress('waiting_switch'), source_traffic: null }
  const nodes = timeline()
  assert.equal(nodes[0].hollow, false)
  assert.equal(nodes[0].statusLabel, 'PolicyStageEmitted')
  assert.equal(nodes[0].trail, 'primary')
  assert.equal(nodes[1].hollow, true)
  assert.equal(nodes[1].type, 'warning')
  assert.equal(nodes[1].statusLabel, 'PolicyEventNotApplied')
  assert.equal(nodes[1].trail, 'pending')
  assert.equal(nodes[2].hollow, true)
  assert.equal(nodes[2].type, 'info')
  assert.equal(nodes[2].statusLabel, 'PolicyStageNotStarted')
  view.selectedEventId = 'publish'
  assert.deepEqual(timeline(), nodes)
  view.selectedEventId = 'observe'
  assert.deepEqual(timeline(), nodes)
})

test('confirmed switching fills its node and advances the solid path to observation', () => {
  const { view, timeline } = viewFor(async () => ({}))
  view.detail = rotationWithProgress('waiting_source')
  const nodes = timeline()
  assert.equal(nodes[1].hollow, false)
  assert.equal(nodes[1].type, 'success')
  assert.equal(nodes[1].trail, 'primary')
  assert.equal(nodes[2].hollow, true)
  assert.equal(nodes[2].type, 'warning')
})

test('failure colors its path red while an emitted retry continues the traversed history', () => {
  const nodes = buildCycleEventTimeline({
    events: [
      { id: 'start', event: 'credential.change.started' },
      { id: 'fail', event: 'credential.change.failed' },
      { id: 'retry', event: 'credential.change.started' },
      { id: 'done', event: 'credential.change.completed' }
    ]
  })
  assert.equal(nodes[0].trail, 'danger')
  assert.equal(nodes[1].type, 'danger')
  assert.equal(nodes[1].hollow, false)
  assert.equal(nodes[1].trail, 'danger')
  assert.equal(nodes[2].trail, 'primary')
})

test('an old observation event and its receipt cannot start observation before the switch', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = rotationWithProgress('waiting_switch')
  view.detail.source_traffic = null
  const application = stages().find((stage) => stage.label === 'PolicyStageWaitingForApplication')
  const observation = stages().find((stage) => stage.label === 'RotationSourceWaitingEvent')
  assert.equal(application.current, true)
  assert.equal(application.completed, false)
  assert.equal(application.icon, 'Clock')
  assert.equal(application.statusLabel, 'PolicyEventNotApplied')
  assert.equal(observation.current, false)
  assert.equal(observation.completed, false)
  assert.equal(observation.icon, 'Clock')
  assert.equal(observation.statusLabel, 'PolicyStageNotStarted')
})

test('confirmed applications advance the current stage to source observation', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = rotationWithProgress('waiting_source')
  const application = stages().find((stage) => stage.label === 'PolicyStageWaitingForApplication')
  const observation = stages().find((stage) => stage.label === 'RotationSourceWaitingEvent')
  assert.equal(application.completed, true)
  assert.equal(application.icon, 'Check')
  assert.equal(application.statusLabel, 'PolicyEventApplied')
  assert.equal(observation.current, true)
  assert.equal(observation.icon, 'Clock')
})

test('an idle source does not bypass the still-pending application confirmation', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = rotationWithProgress('waiting_switch', true)
  const application = stages().find((stage) => stage.label === 'PolicyStageWaitingForApplication')
  const observation = stages().find((stage) => stage.label === 'RotationSourceWaitingEvent')
  assert.equal(application.current, true)
  assert.equal(application.completed, false)
  assert.equal(observation.completed, true)
  assert.equal(observation.statusLabel, 'StandbyObservationCompleted')
})

test('cancellation waits for account restoration rather than highlighting source observation', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = rotationWithProgress('waiting_revert')
  const application = stages().find((stage) => stage.label === 'WaitingForAccountRevert')
  assert.equal(application.current, true)
  assert.equal(application.completed, false)
  assert.equal(
    stages().find((stage) => stage.label === 'RotationSourceWaitingEvent').current,
    false
  )
})

test('historical waiting events without confirmation never render a completion check', () => {
  const { view, stages } = viewFor(async () => ({}))
  view.detail = { ...rotationWithProgress(null), rotation_status: null, status: 'cancelled' }
  let application = stages().find((stage) => stage.label === 'PolicyStageWaitingForApplication')
  assert.equal(application.completed, false)
  assert.equal(application.current, false)
  assert.equal(application.icon, 'Clock')
  view.detail.events[0].confirmed_count = 1
  application = stages().find((stage) => stage.label === 'PolicyStageWaitingForApplication')
  assert.equal(application.completed, true)
})

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
