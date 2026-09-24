import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const helperUrl = new URL(
  '../src/views/accounts/Integration/AccountRotationDetail/rotationEventTimeline.js',
  import.meta.url
)
const helperSource = await readFile(helperUrl, 'utf8')
const { buildEventLanes } = await import(
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
assert.ok(!timeline.includes('rotationId') && !timeline.includes('refreshKey'))
assert.ok(timeline.includes("watch: { credentialId: { immediate: true, handler: 'load' } }"))
assert.ok(timeline.includes("'configuration.updated': 'AppAuditConfigurationUpdated'"))
assert.ok(!timeline.includes('setTimeout') && !timeline.includes('setInterval'))
console.log('Rotation event timeline checks passed')
