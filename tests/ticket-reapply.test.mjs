import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

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
