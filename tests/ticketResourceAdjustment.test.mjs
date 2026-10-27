import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { reactive } from 'vue'
import resourceAvailability from '../src/views/tickets/plugins/resourceAvailability.js'
import { configurePluginField } from '../src/views/tickets/plugins/registry.js'

function bind(component, vm) {
  for (const [key, method] of Object.entries(component.methods)) vm[key] = method.bind(vm)
  return vm
}

test('a failed request from the previous organization cannot clear the current workflow', async () => {
  const source = await readFile(
    new URL('../src/views/tickets/RequestAssetPerm/CreateUpdate.vue', import.meta.url),
    'utf8'
  )
  const method = source
    .match(/async loadFlowOptions\(orgId, beneficiary\) \{[\s\S]*?\n    \},/)[0]
    .replace(/,$/, '')
  const load = new Function('getTicketFlowLabel', `return ({ ${method} }).loadFlowOptions`)(
    (flow) => flow.name
  )
  const requests = []
  const vm = {
    flowRequest: 0,
    fieldsMeta: { workflow_id: { el: {} } },
    $t: (key) => key,
    $axios: { get: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) }
  }
  const old = load.call(vm, 'old-org', 'applicant')
  const current = load.call(vm, 'current-org', 'applicant')
  const flow = { id: 'current-flow', name: 'Current workflow' }
  requests[1].resolve([flow])
  assert.equal(await current, flow)
  requests[0].reject(new Error('offline'))
  assert.equal(await old, undefined)
  assert.deepEqual(vm.flowOptions, [flow])
})

test('description fallback requires a successful empty-resource result and ignores old organizations', async () => {
  const requests = []
  const vm = bind(resourceAvailability, {
    ...resourceAvailability.data(),
    $t: (key) => key,
    $axios: {
      get(url, config) {
        return new Promise((resolve, reject) => requests.push({ config, resolve, reject }))
      }
    }
  })
  const first = vm.loadResourceAvailability('view_secret', 'org-a')
  assert.throws(() => vm.validateAvailability())
  const second = vm.loadResourceAvailability('view_secret', 'org-b', { asset: 'asset-b' })
  requests[0].resolve({ description_allowed: true })
  await first
  assert.equal(vm.resourceAvailability, null)
  requests[1].reject(new Error('offline'))
  await second
  assert.equal(vm.availabilityFailed, true)
  assert.equal(vm.resourceAvailability, null)
  assert.throws(() => vm.validateAvailability())
  const retry = vm.retryResourceAvailability()
  assert.equal(requests[2].config.params.asset, 'asset-b')
  requests[2].resolve({ description_allowed: true })
  await retry
  assert.equal(vm.resourceAvailability.description_allowed, true)
  assert.doesNotThrow(() => vm.validateAvailability())
  const removed = vm.loadResourceAvailability('view_secret', 'org-c')
  resourceAvailability.beforeUnmount.call(vm)
  requests[3].resolve({ description_allowed: true })
  await removed
  assert.equal(vm.resourceAvailability, null)
})

async function panel(name = 'WorkflowPanel') {
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const code = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const globals = {
    IBox: {},
    Dialog: {},
    WorkflowMemberSelect: {},
    CcUsers: {},
    TicketValueList: {},
    TicketResourceAdjustment: {},
    Details: {},
    useDateTime: () => ({}),
    stateLabels: {},
    nodeLabels: {}
  }
  return new Function(...Object.keys(globals), code)(...Object.values(globals))
}

test('save resources submits separately, never approves and includes the viewed revision', async () => {
  const component = await panel('TicketRequestInfo')
  const calls = []
  const vm = bind(component, {
    ...component.data(),
    myTask: { id: 'task-a' },
    object: { org_id: 'org-a' },
    canAdjust: true,
    adjustment: { revision: 2, pending: true },
    $emit() {},
    $t: (key) => key,
    $message: { success() {} },
    $axios: {
      async post(...args) {
        calls.push(args)
      }
    }
  })
  vm.openAdjustment()
  await vm.saveAdjustment({
    resources: { asset: 'asset-a', accounts: ['root'] },
    reason: 'Matched host'
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], '/api/v1/tickets/approval-tasks/task-a/adjust-resources/')
  assert.equal(calls[0][1].expected_revision, 2)
  assert.equal(calls[0][1].reason, 'Matched host')
  assert.equal(vm.adjusting, false)
  assert.equal(vm.saving, false)
  assert.deepEqual(calls[0][2], { params: { oid: 'org-a' } })
})

test('failed saves keep edits; stale organization responses cannot close a new editor', async () => {
  const component = await panel('TicketRequestInfo')
  let reject, resolve
  const errors = []
  const vm = bind(component, {
    ...component.data(),
    myTask: { id: 'task-a' },
    object: { org_id: 'org-a' },
    adjusting: true,
    adjustmentRevision: 1,
    requestConfig: { params: { oid: 'org-a' } },
    $refs: {
      resourceForm: {
        setErrors(data) {
          errors.push(data)
        }
      }
    },
    $axios: {
      post() {
        return new Promise((yes, no) => {
          resolve = yes
          reject = no
        })
      }
    }
  })
  const failure = vm.saveAdjustment({ resources: {}, reason: 'Fix' })
  reject({ response: { status: 400, data: { asset: ['Required'] } } })
  await failure
  assert.equal(vm.adjusting, true)
  assert.deepEqual(errors, [{ asset: ['Required'] }])
  const late = vm.saveAdjustment({ resources: {}, reason: 'Fix' })
  component.beforeUnmount.call(vm)
  resolve({})
  await late
  assert.equal(vm.adjusting, true)
})

test('request editing replaces resource values in place while preserving the explanation', async () => {
  const component = await panel('TicketRequestInfo')
  const vm = {
    adjusting: true,
    items: [
      { name: 'resource_description', value: 'Production database access' },
      { name: 'apply_users', value: ['Alice'] },
      { name: 'asset', value: 'old host' },
      { name: 'accounts', value: ['root'] }
    ],
    adjustment: { fields: [{ name: 'asset' }, { name: 'accounts' }] }
  }
  assert.deepEqual(component.computed.visibleItems.call(vm), vm.items.slice(0, 2))
  vm.adjusting = false
  assert.equal(component.computed.visibleItems.call(vm), vm.items)
})

test('approval waits for the original request form to be saved or cancelled', async () => {
  const component = await panel()
  const calls = []
  const vm = bind(component, {
    ...component.data(),
    editingRequest: true,
    savingRequest: false,
    myTask: { id: 'task-a' },
    instance: { resource_adjustment: { revision: 1, pending: false } },
    requestConfig: {},
    workflowKey: 'org-a',
    $axios: {
      async post(...args) {
        calls.push(args)
      }
    },
    $message: { success() {} },
    $t: (key) => key
  })
  vm.load = async () => {}
  await vm.decide('approve')
  assert.equal(calls.length, 0)
  vm.editingRequest = false
  vm.savingRequest = true
  await vm.decide('approve')
  assert.equal(calls.length, 0)
  vm.savingRequest = false
  await vm.decide('approve')
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1].expected_revision, 1)
})

async function adjustmentForm() {
  const source = await readFile(
    new URL('../src/views/tickets/components/TicketResourceAdjustment.vue', import.meta.url),
    'utf8'
  )
  const code = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const globals = {
    DataForm: {},
    Select2: { name: 'Select2' },
    BasicTree: { name: 'BasicTree' },
    AccountFormatter: {},
    RequiredChange: {},
    configurePluginField
  }
  return new Function(...Object.keys(globals), code)(...Object.values(globals))
}

test('approval editing preserves the original action tree and submits only selected actions', async () => {
  const component = await adjustmentForm()
  const tree = [
    {
      value: 'All',
      label: 'All',
      children: [
        { value: 'connect', label: 'Connect (All protocols)' },
        {
          value: 'Transfer',
          label: 'Transfer',
          children: [
            { value: 'upload', label: 'Upload (RDP, SFTP)' },
            { value: 'download', label: 'Download (RDP, SFTP)' }
          ]
        }
      ]
    }
  ]
  const saved = []
  const vm = bind(component, {
    ...component.data(),
    ticketType: 'apply_asset',
    fields: [
      { name: 'apply_actions', type: 'multiple_choice', required: true, tree },
      { name: 'scopes', type: 'multiple_choice', choices: [{ value: 'one', label: 'One' }] }
    ],
    values: { apply_actions: [{ value: 'connect', label: 'Connect' }] },
    snapshot: {},
    $t: (key) => key,
    $emit: (...args) => saved.push(args)
  })
  vm.configure()
  assert.equal(vm.formFields[0].component.name, 'BasicTree')
  assert.equal(vm.formFields[0].el.tree, tree)
  assert.equal(vm.formFields[0].label, 'Actions')
  assert.equal(vm.formFields[0].helpText, 'ActionsTips')
  assert.deepEqual(vm.initial.apply_actions, ['connect'])
  assert.equal(vm.formFields[1].component.name, 'Select2')
  vm.submit({ ...vm.initial, apply_actions: ['download'], adjustment_reason: 'Download only' })
  assert.deepEqual(saved[0], [
    'save',
    {
      resources: { apply_actions: ['download'], scopes: [] },
      reason: 'Download only'
    }
  ])
})

test('reactive adjustment form completes account loading and discards superseded results', async () => {
  const component = await adjustmentForm()
  const requests = []
  const vm = bind(
    component,
    reactive({
      ...component.data(),
      taskId: 'task',
      orgId: 'org',
      $t: (key) => key,
      formFields: [{ id: 'accounts', el: {} }],
      $axios: {
        get() {
          return new Promise((resolve) => requests.push(resolve))
        }
      }
    })
  )
  const values = { accounts: ['old'] }
  const update = (patch) => Object.assign(values, patch)
  const first = vm.loadAccounts({ name: 'accounts' }, 'asset-a', update)
  const second = vm.loadAccounts({ name: 'accounts' }, 'asset-b', update)
  requests[0](['stale'])
  await first
  assert.equal(vm.formFields[0].el.disabled, true)
  requests[1](['readonly'])
  await second
  assert.equal(vm.formFields[0].el.disabled, false)
  assert.deepEqual(vm.formFields[0].el.options, [{ value: 'readonly', label: 'readonly' }])
  assert.deepEqual(values.accounts, [])
})
