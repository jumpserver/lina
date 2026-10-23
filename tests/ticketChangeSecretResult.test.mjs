import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse, compileTemplate } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketChangeSecretResult.vue', import.meta.url),
  'utf8'
)
const descriptor = parse(source).descriptor
const script = descriptor.script.content
  .replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const openedTasks = []
const component = new Function('IBox', 'useDateTime', 'openTaskPage', script)(
  {},
  () => ({}),
  (taskId) => openedTasks.push(taskId)
)

function state(object) {
  const vm = { object }
  for (const [key, getter] of Object.entries(component.computed)) {
    Object.defineProperty(vm, key, { get: () => getter.call(vm) })
  }
  return vm
}

test('approval alone never displays a successful password change', () => {
  const vm = state({ state: { value: 'approved' }, execution_mode: 'automatic' })
  assert.equal(vm.statusMessage, 'TicketChangeSecretUnavailable')
  assert.equal(vm.progress, 0)
  vm.object.result = {
    state: 'queued',
    counts: { total: 2, pending: 2, success: 0, failed: 0, unverified: 0 }
  }
  assert.equal(vm.statusMessage, 'TicketChangeSecretQueued')
  assert.equal(vm.progress, 0)
  vm.object.result = {
    state: 'running',
    counts: { total: 2, pending: 1, success: 1, failed: 0, unverified: 0 }
  }
  assert.equal(vm.statusMessage, 'TicketChangeSecretRunning')
  assert.equal(vm.progress, 50)
  vm.object.result = {
    state: 'unverified',
    counts: { total: 2, pending: 0, success: 1, failed: 0, unverified: 1 }
  }
  assert.equal(vm.progress, 100)
  assert.equal(vm.statusMessage, 'TicketChangeSecretUnverified')
  assert.equal(vm.tone, 'warning')
  vm.object.state = 'rejected'
  vm.object.result.state = 'success'
  assert.equal(vm.statusMessage, 'TicketChangeSecretUnapproved')
})

test('the execution card template compiles', () => {
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: 'TicketChangeSecretResult.vue',
    id: 'ticket-change-secret'
  })
  assert.deepEqual(result.errors, [])
})

test('execution logs use the worker task ID and remain unavailable before a task starts', () => {
  const vm = state({ state: 'approved', result: { execution_id: 'ticket-id', state: 'queued' } })
  component.methods.openExecutionLog.call(vm)
  assert.deepEqual(openedTasks, [])
  vm.object.result.log_task_id = 'worker-task-id'
  component.methods.openExecutionLog.call(vm)
  assert.deepEqual(openedTasks, ['worker-task-id'])
  assert.match(descriptor.template.content, /v-if="result.log_task_id"/)
  assert.match(descriptor.template.content, /@click="openExecutionLog"/)
  assert.match(descriptor.template.content, /\$t\('ExecutionLog'\)/)
})

test('finished failures show the affected counts without a misleading success progress bar', () => {
  const vm = state({
    state: 'approved',
    result: {
      state: 'failed',
      log_task_id: 'worker',
      counts: { total: 1, success: 0, failed: 1, unverified: 0, pending: 0 }
    }
  })
  assert.equal(vm.helpMessage, 'TicketChangeSecretLogHelp')
  assert.equal(vm.statusIcon, 'CircleCloseFilled')
  assert.deepEqual(
    vm.resultCounts.map(({ key, value }) => [key, value]),
    [
      ['total', 1],
      ['failed', 1]
    ]
  )
  assert.match(descriptor.template.content, /v-if="state === 'running' && result.counts"/)
  delete vm.object.result.log_task_id
  assert.equal(vm.helpMessage, 'TicketChangeSecretFailureHelp')
  vm.object.result.state = 'unverified'
  vm.object.result.counts = { total: 3, success: 1, failed: 1, unverified: 1, pending: 0 }
  assert.equal(vm.helpMessage, 'TicketChangeSecretVerificationHelp')
  assert.equal(vm.statusIcon, 'WarningFilled')
  assert.deepEqual(
    vm.resultCounts.map(({ key }) => key),
    ['total', 'success', 'failed', 'unverified']
  )
  vm.object.state = 'rejected'
  assert.deepEqual(vm.resultCounts, [])
})
