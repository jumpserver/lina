import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/components/WorkflowPanel.vue', import.meta.url),
  'utf8'
)
const code = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const events = []
const eventBus = { emit: (...args) => events.push(args) }
const component = new Function(
  'IBox',
  'Dialog',
  'WorkflowMemberSelect',
  'CcUsers',
  'TicketValueList',
  'useDateTime',
  'stateLabels',
  'nodeLabels',
  'eventBus',
  code
)({}, {}, {}, {}, {}, () => ({}), {}, {}, eventBus)
function setup(post = async () => {}) {
  const calls = []
  events.length = 0
  const vm = {
    ...component.data(),
    workflowKey: 'org:ticket:workflow',
    myTask: { id: 'task' },
    instance: { id: 'workflow' },
    requestConfig: { params: { oid: 'org' } },
    $axios: { post },
    $route: { path: '/tickets/assigned-tickets' },
    $t: (key) => key,
    $message: { success() {} },
    load: async () => calls.push('reload-detail')
  }
  return { vm, calls }
}
for (const operation of ['approve', 'reject', 'cancel', 'transfer', 'add-approver']) {
  test(`${operation} refreshes its owning list without closing the detail`, async () => {
    const { vm, calls } = setup()
    vm.target = 'next-reviewer'
    vm.reassignTaskId = 'task'
    await component.methods.decide.call(vm, operation)
    assert.deepEqual(events, [['drawer-resource-change', { path: '/tickets/assigned-tickets' }]])
    assert.deepEqual(calls, ['reload-detail'])
  })
}
test('failed or outdated decisions do not refresh another ticket list', async () => {
  const failed = setup(async () => {
    throw new Error('offline')
  })
  await component.methods.decide.call(failed.vm, 'approve')
  assert.deepEqual(failed.calls, [])
  assert.deepEqual(events, [])
  const stale = setup(async () => {
    stale.vm.workflowKey = 'other:ticket:workflow'
  })
  await component.methods.decide.call(stale.vm, 'approve')
  assert.deepEqual(stale.calls, [])
  assert.deepEqual(events, [])
})
