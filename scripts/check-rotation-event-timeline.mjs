import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const helperUrl = new URL(
  '../src/views/accounts/Integration/AccountRotationDetail/rotationEventTimeline.js',
  import.meta.url
)
const helperSource = await readFile(helperUrl, 'utf8')
const { buildEventLanes, groupClientEvents, receiptStatus } = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(helperSource)}`
)

const data = {
  events: [
    { id: 'third', sequence: 3 },
    { id: 'first', sequence: 1 },
    { id: 'second', sequence: 2 }
  ],
  instances: [
    {
      id: 'sdk',
      receipts: [
        { event_id: 'first', publish_result: 'published', received_at: 'now' },
        { event_id: 'second', publish_result: 'published', received_at: null },
        { event_id: 'third', publish_result: 'pending', received_at: 'later' }
      ]
    },
    {
      id: 'late-agent',
      receipts: [{ event_id: 'third', publish_result: 'failed', received_at: null }]
    }
  ]
}
const { events, lanes } = buildEventLanes(data)
assert.deepEqual(
  events.map((event) => event.id),
  ['first', 'second', 'third']
)
assert.deepEqual(
  lanes[0].nodes.map((node) => node.status),
  ['received', 'unacknowledged', 'received']
)
assert.equal(lanes[0].receivedCount, 2)
assert.equal(lanes[0].targetCount, 3)
assert.deepEqual(
  lanes[1].nodes.map((node) => node.status),
  ['not_targeted', 'not_targeted', 'failed']
)
assert.equal(lanes[1].targetCount, 1)
assert.equal(data.events[0].id, 'third')
assert.deepEqual(buildEventLanes(null), { events: [], lanes: [] })
const detailPath = '../src/views/accounts/Integration/AccountRotationDetail/'
const detail = await readFile(new URL(`${detailPath}index.vue`, import.meta.url), 'utf8')
const basic = await readFile(
  new URL(`${detailPath}AccountRotationInfo.vue`, import.meta.url),
  'utf8'
)
const timeline = await readFile(
  new URL(`${detailPath}RotationEventTimeline.vue`, import.meta.url),
  'utf8'
)
assert.ok(detail.includes(':label="$t(\'RotationEventReception\')"'))
assert.ok(detail.includes('v-if="activeTab === \'events\'"'))
assert.ok(detail.includes('@tab-click="refreshEvents"'))
assert.ok(detail.includes(':key="eventsKey"'))
assert.ok(detail.includes(':subscription="object.mode === \'subscription\'"'))
assert.ok(!detail.includes('<ApplicationAudit'))
assert.ok(detail.includes('this.eventsKey += 1'))
assert.ok(!basic.includes('RotationEventTimeline'))
assert.doesNotMatch(basic, /ApplicationSwitchStatus|switch-overview|instanceTableConfig/)
assert.match(basic, /<QuickActions/)
assert.match(basic, /\$t\('RotationProgress'\)/)
assert.ok(detail.includes('<CredentialEventBrowser'))
assert.ok(timeline.includes('rotationId'))
const timelineComponent = new Function(
  'IBox',
  timeline
    .match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*\n/gm, '')
    .replace('export default', 'return')
)({})
let scrollPosition
const pageVm = {
  selection: { clientId: 'sdk', eventId: 'first' },
  $nextTick: (callback) => callback(),
  $refs: {
    timelineScroll: {
      scrollTo: (position) => {
        scrollPosition = position
      }
    }
  }
}
timelineComponent.watch.page.call(pageVm)
assert.equal(pageVm.selection, null)
assert.deepEqual(scrollPosition, { top: 0 })
const browserSource = await readFile(
  new URL(`${detailPath}CredentialEventBrowser.vue`, import.meta.url),
  'utf8'
)
let resizeCallback
let observedDrawer
let observerDisconnected = false
const browserComponent = new Function(
  'IBox',
  'RotationEventTimeline',
  'receiptStatus',
  'ResizeObserver',
  browserSource
    .match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default', 'return')
)(
  {},
  {},
  receiptStatus,
  class {
    constructor(callback) {
      resizeCallback = callback
    }
    observe(drawer) {
      observedDrawer = drawer
    }
    disconnect() {
      observerDisconnected = true
    }
  }
)
let drawerWidth = 1400
const parentDrawer = { getBoundingClientRect: () => ({ width: drawerWidth }) }
const browserVm = {
  $el: { closest: () => parentDrawer },
  clientRequest: 0,
  historyRequest: 0
}
browserComponent.mounted.call(browserVm)
assert.equal(observedDrawer, parentDrawer)
assert.equal(browserVm.comparisonWidth, '1400px')
drawerWidth = 980
resizeCallback()
assert.equal(browserVm.comparisonWidth, '980px')
browserComponent.beforeUnmount.call(browserVm)
assert.equal(observerDisconnected, true)
assert.ok(helperSource.includes("'configuration.updated': 'AppAuditConfigurationUpdated'"))
assert.ok(!timeline.includes('setTimeout') && !timeline.includes('setInterval'))
const { createCredentialEventFixture, fixtureHistory, fixtureRotation } =
  await import('./fixtures/credential-events.mjs')
for (const mode of ['rotation', 'subscription']) {
  const fixture = createCredentialEventFixture(mode, 300)
  const page = fixtureHistory(fixture, { limit: 20 })
  assert.equal(page.count, 300)
  assert.equal(page.results.length, 20)
  assert.equal(fixtureHistory(fixture, { client_type: 'agent' }).count, 150)
  assert.equal(fixtureHistory(fixture, { state: 'offline' }).count, 60)
  assert.equal(fixtureHistory(fixture, { client_search: 'nothing-matches' }).count, 0)
  const client = fixture.clients[0]
  const history = fixtureHistory(fixture, { client_id: client.id, limit: 30 })
  assert.equal(history.count, 180)
  assert.equal(history.results.length, 30)
  assert.ok(history.results[0].published_at > history.results[29].published_at)
  assert.ok(groupClientEvents(history.results).length > 1)
  const offline = fixtureHistory(fixture, { client_id: fixture.clients[7].id })
  assert.notEqual(offline.latest_event.id, offline.latest_received_event.id)
  assert.equal(receiptStatus(offline.latest_event), 'unacknowledged')
  if (mode === 'rotation') {
    const round = fixtureRotation(fixture, history.latest_event.rotation_id)
    assert.equal(round.events.length, 6)
    assert.equal(buildEventLanes(round).lanes.length, 300)
  }
}
assert.equal(createCredentialEventFixture('subscription', 500).clients.length, 500)
console.log('Rotation event timeline checks passed')
