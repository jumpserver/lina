import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { compile } from '@vue/compiler-dom'
import { renderToString } from '@vue/server-renderer'

const source = await readFile(
  new URL('../src/views/tickets/RequestAssetPerm/CreateUpdate.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const script = descriptor.script.content
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace('export default', 'return')
const dependencies = {
  Select2: {},
  TicketWorkflowSelect: {},
  GenericCreateUpdatePage: {},
  AccountFormatter: {},
  ExpireNoticePolicy: {},
  ExpireSoonNoticeMinutes: {},
  resourceAvailability: {},
  mapGetters: () => ({}),
  mapState: () => ({}),
  getTicketFlowLabel: (flow) => flow.name,
  store: {
    getters: {
      currentUser: { id: 'user', name: 'Applicant' },
      publicSettings: {
        TICKET_AUTHORIZE_DEFAULT_TIME: 2,
        TICKET_AUTHORIZE_DEFAULT_TIME_UNIT: 'hour'
      }
    }
  },
  getDaysFuture: (days, date) => new Date(date.getTime() + days * 86400000),
  hydrateExpireNoticeFormValue: (value) => value,
  normalizeExpireNoticePayload: (value) => value,
  isExpireSoonNoticeAtFuture: () => true,
  isPositiveInteger: () => true
}
const component = new Function(...Object.keys(dependencies), script)(...Object.values(dependencies))
function vmFor(prefill, flows = [{ id: 'flow-new', name: 'Current workflow' }]) {
  const calls = []
  const vm = {
    $t: (key) => key,
    $route: { query: { source_ticket: 'old-ticket', oid: 'org-a' } },
    currentOrg: { id: 'org-a' },
    workbenchOrgs: [
      { id: 'org-a', name: 'A' },
      { id: 'org-b', name: 'B' }
    ],
    availabilityParams: {},
    async loadResourceAvailability(type, orgId, selection) {
      calls.push({ type, orgId, selection })
    },
    $axios: {
      async get(url, options) {
        calls.push({ url, options })
        if (url.includes('/actions/')) {
          if (prefill instanceof Error) throw prefill
          return structuredClone(prefill)
        }
        return flows
      },
      async post(url, payload) {
        calls.push({ url, payload })
        return { id: 'new-ticket' }
      }
    }
  }
  Object.assign(vm, component.data.call(vm))
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  return { vm, calls }
}
function prefill() {
  return {
    source_ticket: { id: 'old-ticket', serial_num: '202610260001', org_id: 'org-a', kind: 'renew' },
    title: 'Access production',
    comment: 'Existing purpose',
    org_id: 'org-a',
    workflow_id: 'flow-old',
    request_data: {
      apply_users: ['beneficiary'],
      apply_assets: ['asset-a'],
      apply_nodes: [],
      apply_accounts: ['root'],
      apply_actions: ['connect'],
      apply_date_start: '2030-01-01T00:00:00Z',
      apply_date_expired: '2030-01-02T00:00:00Z'
    },
    warnings: { assets: 1 },
    users: [{ id: 'beneficiary', name: 'Target', username: 'target' }]
  }
}

test('renewal prefill preserves recipient and frozen resources, replacing an unavailable workflow', async () => {
  const { vm, calls } = vmFor(prefill())
  await vm.initialize()
  assert.equal(vm.loadError, false)
  assert.equal(vm.initial.title, 'Access production')
  assert.equal(vm.initial.apply_users, 'beneficiary')
  assert.deepEqual(vm.initial.apply_assets, ['asset-a'])
  assert.deepEqual(vm.initial.apply_nodes, [])
  assert.equal(vm.initial.apply_date_expired, '2030-01-02T00:00:00Z')
  assert.equal(vm.initial.workflow_id, 'flow-new')
  assert.equal(vm.prefillWarnings.workflow, true)
  assert.equal(vm.prefillWarnings.assets, 1)
  assert.ok(calls.some((call) => call.options?.params?.beneficiary === 'beneficiary'))
})

test('an available original workflow stays selected and submission records the source', async () => {
  const { vm, calls } = vmFor(prefill(), [{ id: 'flow-old', name: 'Original, current version' }])
  await vm.initialize()
  assert.equal(vm.initial.workflow_id, 'flow-old')
  const result = await vm.performSubmit({ ...vm.initial, apply_users: ['beneficiary'] })
  assert.equal(result.id, 'new-ticket')
  const sent = calls.find((call) => call.payload).payload
  assert.equal(sent.source_ticket_id, 'old-ticket')
  assert.equal(sent.type, 'apply_asset')
  assert.equal(Object.hasOwn(sent, 'applicant'), false)
  assert.equal(Object.hasOwn(sent.request_data, 'source_ticket_id'), false)
  assert.deepEqual(sent.request_data.apply_assets, ['asset-a'])
  assert.equal(vm.submitted, true)
})

test('changing organizations clears inherited resources and resets the beneficiary', async () => {
  const { vm } = vmFor(prefill())
  await vm.initialize()
  const form = { ...vm.initial }
  await vm.fieldsMeta.org_id.on.change(['org-b'], (changes) => Object.assign(form, changes))
  assert.deepEqual(form.apply_assets, [])
  assert.deepEqual(form.apply_nodes, [])
  assert.deepEqual(form.apply_accounts, [])
  assert.equal(form.apply_users, 'user')
  assert.equal(vm.selectedOrgId, 'org-b')
  assert.equal(component.computed.isRenewal.call(vm), false)
  vm.prefillWarnings.no_workflow = true
  await vm.loadFlowOptions('org-b', 'user')
  assert.equal(vm.prefillWarnings.no_workflow, undefined)
})

test('an inaccessible source blocks the form instead of silently creating an empty request', async () => {
  const { vm } = vmFor(new Error('Forbidden'))
  await vm.initialize()
  assert.equal(vm.loadError, true)
  assert.equal(vm.loading, false)
  assert.equal(vm.sourceTicket, null)
})

test('no workflow is explained, and a new submission is required after returning from success', async () => {
  const { vm } = vmFor(prefill(), [])
  await vm.initialize()
  assert.equal(vm.initial.workflow_id, '')
  assert.equal(vm.prefillWarnings.no_workflow, true)
  let initialized = 0
  vm.initialize = () => {
    initialized++
  }
  component.activated.call(vm)
  assert.equal(initialized, 0)
  vm.submitted = true
  component.activated.call(vm)
  assert.equal(initialized, 1)
})

const listSource = await readFile(
  new URL('../src/views/tickets/BaseTicketList.vue', import.meta.url),
  'utf8'
)
const listScript = parse(listSource)
  .descriptor.script.content.replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace('export default', 'return')
const listDependencies = {
  GenericListPage: {},
  DetailFormatter: {},
  TagChoicesFormatter: {},
  APPROVE: 'approved',
  CLOSED: 'closed',
  OPEN: 'pending',
  REJECT: 'rejected',
  TICKET_TYPE_I18N_KEYS: {},
  getTicketStateLabel: () => '',
  getTicketTypeLabel: () => ''
}
const listComponent = new Function(...Object.keys(listDependencies), listScript)(
  ...Object.values(listDependencies)
)

test('ticket lists omit the actions column on every entry point', () => {
  for (const name of ['MyTicketList', 'AssignedTicketList', 'AuditTicketList']) {
    const config = listComponent.data.call({
      $t: (key) => key,
      $route: { name },
      $hasPerm: () => true
    }).ticketTableConfig
    assert.equal(config.columnsMeta.actions.has, false)
    assert.equal(config.columnsShow.min.includes('actions'), false)
    assert.equal(config.columnsShow.default.includes('actions'), false)
  }
})

test('a single standard action stays inline and disabled actions cannot invoke their callback', async () => {
  const source = await readFile(
    new URL('../src/components/Table/TableFormatters/ActionsFormatter.vue', import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const formatter = new Function('BaseFormatter', 'Icon', script)({}, {})
  let called = 0
  const action = { name: 'reapply', title: '重新申请', disabled: true, callback: () => called++ }
  const vm = { cleanedActions: [action], colActions: {} }
  assert.deepEqual(formatter.computed.actions.call(vm), [action])
  assert.deepEqual(formatter.computed.moreActions.call(vm), [])
  assert.equal(formatter.methods.getButtonProps(action).disabled, true)
  assert.equal(formatter.methods.getButtonProps(action)['aria-label'], '重新申请')
  formatter.methods.handleActionClick(action)
  assert.equal(called, 0)
  action.disabled = false
  formatter.methods.handleActionClick(action)
  assert.equal(called, 1)
})

test('asset requests require an asset or node even when all accounts are selected', () => {
  const { vm } = vmFor(prefill())
  vm.resourceAvailability = { description_allowed: false }
  vm.availabilityParams = { selection: { apply_nodes: '' } }
  const validate = (assets) => {
    let error
    vm.fieldsMeta.apply_assets.rules[0].validator({}, assets, (result) => {
      error = result
    })
    return error
  }
  assert.equal(validate([]).message, 'RequiredAssetOrNode')
  assert.equal(validate(['asset-a']), undefined)
  vm.availabilityParams.selection.apply_nodes = 'node-a'
  assert.equal(validate([]), undefined)
  vm.availabilityParams.selection.apply_nodes = ''
  assert.equal(validate([]).message, 'RequiredAssetOrNode')
  vm.resourceAvailability = { description_allowed: true }
  assert.equal(validate([]), undefined)
  assert.equal(vm.fieldsMeta.resource_description.hidden(), false)
  assert.equal(vm.fieldsMeta.resource_description.rules[0].required, true)
})

test('changing a node refreshes availability before revalidating the asset error', async () => {
  const { vm } = vmFor(prefill())
  const checks = []
  vm.availabilityParams = { selection: { apply_assets: 'asset-a' } }
  vm.loadResourceAvailability = async (type, org, selection) => {
    vm.availabilityParams.selection = selection
    vm.resourceAvailability = { description_allowed: false }
  }
  vm.$refs = {
    form: {
      $refs: {
        createUpdateForm: {
          validateField(field, callback) {
            checks.push({ field, nodes: vm.availabilityParams.selection.apply_nodes })
            callback()
          }
        }
      }
    }
  }
  await vm.resourceSelectionChanged('apply_nodes', [{ id: 'node-a' }])
  await vm.resourceSelectionChanged('apply_nodes', [])
  assert.deepEqual(checks, [
    { field: 'apply_assets', nodes: 'node-a' },
    { field: 'apply_assets', nodes: '' }
  ])
  assert.equal(vm.availabilityParams.selection.apply_assets, 'asset-a')
})

test('workflow failures stay in the asset form and retry preserves the recipient and draft', async () => {
  const { vm } = vmFor(prefill())
  await vm.initialize()
  const draft = structuredClone(vm.initial)
  const original = structuredClone(draft)
  let resolve
  const calls = []
  vm.$axios.get = async (url, options) => {
    calls.push(options)
    throw new Error('offline')
  }
  await vm.fieldsMeta.workflow_id.on.retry([], (patch) => Object.assign(draft, patch))
  const field = vm.fieldsMeta.workflow_id.el
  assert.equal(field.failed, true)
  assert.equal(field.loading, false)
  assert.equal(component.computed.workflowReady.call(vm), false)
  assert.equal(vm.loadError, false)
  vm.$axios.get = (url, options) => {
    calls.push(options)
    return new Promise((done) => {
      resolve = done
    })
  }
  const retry = vm.fieldsMeta.workflow_id.on.retry([], (patch) => Object.assign(draft, patch))
  assert.equal(field.loading, true)
  assert.equal(field.failed, false)
  assert.equal(component.computed.workflowReady.call(vm), false)
  resolve([{ id: 'recovered-flow', name: 'Recovered' }])
  await retry
  assert.deepEqual(draft, { ...original, workflow_id: 'recovered-flow' })
  assert.equal(component.computed.workflowReady.call(vm), true)
  assert.equal(field.disabled, true)
  assert.equal(calls[1].params.beneficiary, 'beneficiary')
  assert.equal(calls[1].params.org_id, 'org-a')
  assert.equal(calls[1].disableFlashErrorMsg, true)
  vm.$axios.get = async () => []
  await vm.fieldsMeta.workflow_id.on.retry([], (patch) => Object.assign(draft, patch))
  assert.equal(component.computed.workflowReady.call(vm), false)
  assert.equal(field.failed, false)
  assert.deepEqual(draft, { ...original, workflow_id: '' })
})

const detailSource = await readFile(
  new URL('../src/views/tickets/RequestAssetPerm/Detail/index.vue', import.meta.url),
  'utf8'
)
const detailScript = parse(detailSource)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const detail = new Function(
  'GenericDetailPage',
  'TabPage',
  'TicketDetail',
  'TicketActivity',
  detailScript
)({}, {}, {}, {})

test('only eligible rejected asset requests offer reapply and retain the source organization', () => {
  const pushed = []
  const vm = {
    ticket: {
      id: 'old-ticket',
      org_id: 'org-a',
      state: { value: 'rejected' },
      reapply_action: 'reapply'
    },
    $router: { push: (location) => pushed.push(location) }
  }
  Object.defineProperty(vm, 'canReapply', { get: () => detail.computed.canReapply.call(vm) })
  assert.equal(vm.canReapply, true)
  detail.methods.reapply.call(vm)
  assert.deepEqual(pushed, [
    {
      name: 'RequestAssetPermTicketCreateUpdate',
      query: { source_ticket: 'old-ticket', oid: 'org-a' }
    }
  ])
  const eligible = vm.ticket
  for (const patch of [
    { reapply_action: null },
    { reapply_action: 'renew' },
    ...['pending', 'approved', 'closed', 'expired', 'error'].map((value) => ({ state: { value } })),
    { id: '' },
    { org_id: '' },
    { state: undefined }
  ]) {
    vm.ticket = { ...eligible, ...patch }
    assert.equal(vm.canReapply, false)
    detail.methods.reapply.call(vm)
  }
  assert.equal(pushed.length, 1)
})

test('detail page forwards custom header actions only after a successful load, preserving default actions', async () => {
  const source = await readFile(
    new URL('../src/layout/components/GenericDetailPage/index.vue', import.meta.url),
    'utf8'
  )
  const render = new Function(
    'Vue',
    compile(parse(source).descriptor.template.content, {
      mode: 'function',
      prefixIdentifiers: true
    }).code
  )(Vue)
  for (const [loading, loadError, hasRightSide, custom, expected] of [
    [false, '', false, true, 'Reapply'],
    [false, '', true, false, 'Default actions'],
    [false, '', false, false, ''],
    [true, '', true, true, ''],
    [false, 'Forbidden', true, true, '']
  ]) {
    const page = {
      render,
      components: {
        TabPage: {
          setup:
            (_, { slots }) =>
            () =>
              Vue.h('header', slots.headingRightSide?.())
        },
        ActionsGroup: { render: () => Vue.h('button', 'Default actions') },
        ElResult: { render: () => Vue.h('div') }
      },
      setup: () => ({
        iActiveMenu: 'TicketDetail',
        iSubmenu: [],
        detailTitle: 'Ticket',
        drawer: true,
        handleTabClick: () => {},
        loading,
        loadError,
        hasRightSide,
        pageActions: []
      })
    }
    const app = Vue.createSSRApp({
      render: () =>
        Vue.h(page, {}, custom ? { headingRightSide: () => Vue.h('button', 'Reapply') } : {})
    })
    const html = await renderToString(app)
    assert.equal(html.includes('Reapply'), expected === 'Reapply')
    assert.equal(html.includes('Default actions'), expected === 'Default actions')
  }
})
