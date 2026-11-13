import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketActivity.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const activity = new Function(
  'IBox',
  'CcUsers',
  'TicketAdjustmentDiff',
  'TicketCondition',
  'useDateTime',
  script
)({}, {}, {}, {}, () => ({}))

test('hides task and node lifecycle events while retaining actual operations and the original events', () => {
  const types = [
    'workflow.started',
    'node.entered',
    'approval.created',
    'approval.approved',
    'approval.created',
    'approval.transferred',
    'approval.created',
    'approval.added',
    'approval.rejected',
    'approval.cancelled',
    'node.completed',
    'workflow.cancelled',
    'workflow.completed',
    'approval.timed_out',
    'workflow.expired',
    'resources.adjusted',
    'workflow.error',
    'action.executed',
    'secret.viewed',
    'replay.downloaded'
  ]
  const events = types.map((type, id) => ({ id, type, data: { comment: `comment-${id}` } }))
  const original = structuredClone(events)
  assert.deepEqual(
    activity.computed.visibleEvents.call({ events }),
    [0, 3, 5, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((i) => events[i])
  )
  assert.deepEqual(events, original)
})

test('hides empty CC records and retains configured recipients even when already copied', () => {
  const recipient = { id: 'reviewer-id', username: 'reviewer' }
  const events = [
    { type: 'cc.added', data: { recipients: [] } },
    { type: 'cc.added', data: {} },
    { type: 'cc.added', data: { recipients: null } },
    { type: 'cc.added', data: { recipients: [recipient], added_recipients: [recipient] } },
    { type: 'cc.added', data: { recipients: [recipient], added_recipients: [] } }
  ]
  const original = structuredClone(events)
  assert.deepEqual(activity.computed.visibleEvents.call({ events }), events.slice(3))
  assert.deepEqual(events, original)
})

test('pagination uses all received events even when an entire page is hidden', async () => {
  const hiddenTypes = [
    'approval.created',
    'approval.cancelled',
    'node.entered',
    'node.completed',
    'cc.added'
  ]
  const hidden = Array.from({ length: 50 }, (_, id) => ({
    id,
    type: hiddenTypes[id % hiddenTypes.length],
    data: { recipients: [] }
  }))
  const approved = { id: 50, type: 'approval.approved', data: { comment: 'Approved' } }
  const offsets = []
  const vm = {
    events: [],
    requestId: 0,
    loading: false,
    object: { workflow_instance: 'instance-id', org_id: 'org-id' },
    $axios: {
      async get(url, { params }) {
        if (!url.endsWith('/events/')) return { nodes: [] }
        offsets.push(params.offset)
        return params.offset === 0
          ? { results: hidden, next: 'next-page' }
          : { results: [approved], next: null }
      }
    }
  }
  await activity.methods.load.call(vm)
  assert.deepEqual(activity.computed.visibleEvents.call(vm), [])
  assert.equal(vm.moreEvents, true)
  await activity.methods.load.call(vm, true)
  assert.deepEqual(offsets, [0, 50])
  assert.deepEqual(activity.computed.visibleEvents.call(vm), [approved])
  assert.equal(vm.events.length, 51)
  assert.equal(vm.moreEvents, false)
})
