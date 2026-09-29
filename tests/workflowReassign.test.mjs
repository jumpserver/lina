import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

async function component(name, globals = {}) {
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  // eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
  return new Function(...Object.keys(globals), script)(...Object.values(globals))
}
function bindMethods(component, vm) {
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  return vm
}

async function workflowPanel() {
  return component('WorkflowPanel', {
    IBox: {},
    Dialog: {},
    WorkflowMemberSelect: {},
    CcUsers: {},
    TicketValueList: {},
    useDateTime: () => ({}),
    stateLabels: {},
    nodeLabels: {}
  })
}

test('member search ignores stale responses, paginates, retries and clears the previous target', async () => {
  const picker = await component('WorkflowMemberSelect')
  const requests = []
  const vm = bindMethods(picker, {
    ...picker.data(),
    url: '/candidates/?oid=org-1',
    modelValue: 'previous',
    $emit(event, value) {
      this.modelValue = value
    },
    $axios: {
      get(url, config) {
        return new Promise((resolve, reject) => requests.push({ url, config, resolve, reject }))
      }
    }
  })
  const old = vm.reset()
  assert.equal(vm.modelValue, null)
  vm.search = 'alice'
  const current = vm.reset()
  requests[0].resolve({ results: [{ id: 'old' }], next: null })
  await old
  assert.deepEqual(vm.members, [])
  assert.equal(vm.loading, true)
  requests[1].resolve({ results: [{ id: 'one' }], next: '/next/' })
  await current
  assert.equal(vm.hasMore, true)
  assert.deepEqual(requests[1].config.params, { search: 'alice', offset: 0, limit: 20 })
  const more = vm.load()
  requests[2].reject(new Error('offline'))
  await more
  assert.equal(vm.error, true)
  assert.deepEqual(vm.members, [{ id: 'one' }])
  const retry = vm.load()
  assert.equal(requests[3].config.params.offset, 1)
  requests[3].resolve({ results: [{ id: 'two' }], next: null })
  await retry
  assert.deepEqual(vm.members, [{ id: 'one' }, { id: 'two' }])
  assert.equal(vm.error, false)
  assert.equal(vm.hasMore, false)
  const last = vm.reset()
  picker.beforeUnmount.call(vm)
  requests[4].resolve({ results: [{ id: 'disposed' }], next: null })
  await last
  assert.deepEqual(vm.members, [])
})

test('reselecting a member clears the old target and respects the submitting state', async () => {
  const picker = await component('WorkflowMemberSelect')
  const vm = bindMethods(picker, {
    ...picker.data(),
    modelValue: 'previous',
    disabled: true,
    $refs: {},
    $nextTick: (callback) => callback(),
    $emit(event, value) {
      this.modelValue = value
    }
  })
  vm.choose()
  assert.equal(vm.choosing, false)
  assert.equal(vm.modelValue, 'previous')
  vm.select('another')
  assert.equal(vm.modelValue, 'previous')

  vm.disabled = false
  vm.choose()
  assert.equal(vm.choosing, true)
  assert.equal(vm.modelValue, null)
  vm.select('another')
  assert.equal(vm.choosing, false)
  assert.equal(vm.modelValue, 'another')
})

test('reassignment validates the current task, submits once and preserves failed drafts', async () => {
  const panel = await workflowPanel()
  const requests = []
  const vm = bindMethods(panel, {
    ...panel.data(),
    myTask: { id: 'task' },
    object: { id: 'ticket', org_id: 'org' },
    requestConfig: { params: { oid: 'org' } },
    $axios: {
      async post(...args) {
        requests.push(args)
      },
      async get() {
        return { id: 'ticket' }
      }
    },
    $message: { success() {} },
    $t: (key) => key
  })
  vm.load = async () => {}
  vm.myTask = null
  vm.openReassign('transfer')
  assert.equal(vm.reassignVisible, false)
  vm.myTask = { id: 'task' }
  vm.busy = true
  vm.openReassign('transfer')
  assert.equal(vm.reassignVisible, false)
  vm.busy = false
  vm.comment = 'original note'
  vm.openReassign('transfer')
  assert.equal(vm.reassignComment, 'original note')
  vm.reassignComment = 'Transfer to database specialist'
  assert.equal(vm.comment, 'original note')
  await vm.decide('transfer')
  assert.equal(requests.length, 0, 'a recipient is required')
  vm.target = 'member'
  vm.myTask = null
  await vm.decide('transfer')
  assert.equal(requests.length, 0, 'the original task must still exist')
  vm.myTask = { id: 'next-task' }
  await vm.decide('transfer')
  assert.equal(requests.length, 0, 'a new task must not inherit an open reassignment')
  assert.equal(vm.reassignComment, 'Transfer to database specialist')
  vm.myTask = { id: 'task' }
  await vm.decide('transfer')
  assert.equal(requests[0][0], '/api/v1/tickets/approval-tasks/task/transfer/')
  assert.deepEqual(requests[0][1], { comment: 'Transfer to database specialist', target: 'member' })
  assert.deepEqual(requests[0][2], { params: { oid: 'org' } })
  assert.equal(vm.reassignVisible, false)
  vm.openReassign('add-approver')
  vm.target = 'another'
  vm.reassignComment = 'Please verify permissions'
  await vm.decide('add-approver')
  assert.deepEqual(requests[1][1], { comment: 'Please verify permissions', target: 'another' })
  vm.comment = 'Approved'
  vm.reassignComment = 'unused dialog draft'
  await vm.decide('approve')
  assert.deepEqual(requests[2][1], { comment: 'Approved' })

  vm.comment = 'approval draft'
  vm.openReassign('transfer')
  vm.target = 'member'
  vm.reassignComment = 'Keep this transfer explanation'
  let rejectRequest
  vm.$axios.post = (...args) => {
    requests.push(args)
    return new Promise((resolve, reject) => {
      rejectRequest = reject
    })
  }
  const pending = vm.decide('transfer')
  assert.equal(vm.busy, true)
  await vm.decide('transfer')
  assert.equal(requests.length, 4, 'repeated clicks must not submit again')
  rejectRequest(new Error('offline'))
  await pending
  assert.equal(vm.busy, false)
  assert.equal(vm.reassignVisible, true)
  assert.equal(vm.target, 'member')
  assert.equal(vm.reassignComment, 'Keep this transfer explanation')
  assert.equal(vm.comment, 'approval draft')
})

test('workflow refreshes and submitted decisions cannot overwrite a newer ticket context', async () => {
  const panel = await workflowPanel()
  const requests = []
  const vm = bindMethods(panel, {
    ...panel.data(),
    myTask: { id: 'task' },
    object: { id: 'ticket-a', org_id: 'org-a', workflow_instance: 'workflow-a' },
    $axios: {
      get(url, config) {
        return new Promise((resolve) => requests.push({ url, config, resolve }))
      }
    },
    $message: {
      success() {
        assert.fail('An old decision must not announce success on a new ticket')
      }
    },
    $t: (key) => key
  })
  for (const key of ['workflowKey', 'requestConfig']) {
    Object.defineProperty(vm, key, { get: () => panel.computed[key].call(vm) })
  }
  try {
    const first = vm.load(true)
    const latest = vm.load(true)
    requests[1].resolve({ id: 'latest', state: 'approved' })
    await latest
    requests[0].resolve({ id: 'stale', state: 'approved' })
    await first
    assert.equal(vm.instance.id, 'latest')

    const outdated = vm.load(true)
    vm.comment = 'old approval draft'
    vm.reassignComment = 'old reassignment draft'
    vm.reassignVisible = true
    vm.target = 'old-member'
    vm.object = { id: 'ticket-b', org_id: 'org-b', workflow_instance: 'workflow-b' }
    panel.watch.workflowKey.handler.call(vm)
    assert.equal(vm.instance, null)
    assert.equal(vm.comment, '')
    assert.equal(vm.reassignComment, '')
    assert.equal(vm.reassignVisible, false)
    assert.equal(vm.target, null)
    requests[2].resolve({ id: 'wrong-context', state: 'approved' })
    await outdated
    assert.equal(vm.instance, null)
    assert.equal(requests[3].url, '/api/v1/tickets/workflow-instances/workflow-b/')
    assert.deepEqual(requests[3].config, { params: { oid: 'org-b' } })
    requests[3].resolve({ id: 'workflow-b', state: 'approved' })
    await Promise.resolve()
    assert.equal(vm.instance.id, 'workflow-b')

    let finishDecision
    vm.$axios.post = () =>
      new Promise((resolve) => {
        finishDecision = resolve
      })
    vm.openReassign('transfer')
    vm.target = 'member-b'
    const pending = vm.decide('transfer')
    vm.object = { id: 'ticket-c', org_id: 'org-c', workflow_instance: 'workflow-c' }
    let refreshes = 0
    vm.load = async () => {
      refreshes++
    }
    panel.watch.workflowKey.handler.call(vm)
    vm.comment = 'new ticket draft'
    const expectedRefreshes = refreshes
    finishDecision()
    await pending
    assert.equal(refreshes, expectedRefreshes, 'an old POST must not refresh the new ticket')
    assert.equal(requests.length, 4, 'an old POST must not fetch or overwrite the new ticket')
    assert.equal(vm.object.id, 'ticket-c')
    assert.equal(vm.comment, 'new ticket draft')
  } finally {
    panel.beforeUnmount.call(vm)
  }
})
