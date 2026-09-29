import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRequestPayload } from '../src/views/tickets/plugins/form.js'

test('plugin submission includes only declared parameters and preserves literal file paths', () => {
  const payload = buildRequestPayload(
    {
      type: 'file_transfer',
      fields: [
        { name: 'paths', type: 'list', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'optional', type: 'string' }
      ]
    },
    {
      title: 'Download',
      org_id: 'org',
      workflow_id: 'flow',
      param_paths: ' /tmp/a,b.txt\n\n/tmp/c.txt ',
      param_duration: 600,
      param_optional: '',
      applicant: 'someone-else',
      param_secret: 'must-not-send'
    }
  )
  assert.deepEqual(payload, {
    type: 'file_transfer',
    title: 'Download',
    org_id: 'org',
    workflow_id: 'flow',
    comment: '',
    request_data: { paths: ['/tmp/a,b.txt', '/tmp/c.txt'], duration: 600 }
  })
})

async function createAccountForm(get) {
  const { readFile } = await import('node:fs/promises')
  const { parse } = await import('@vue/compiler-sfc')
  const source = await readFile(
    new URL('../src/views/tickets/plugins/Create.vue', import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  // eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
  const component = new Function(
    'mapGetters',
    'mapState',
    'GenericCreateUpdatePage',
    'IBox',
    'Select2',
    'Required',
    'RequiredChange',
    'AssetRequest',
    'getTicketTypeLabel',
    'buildRequestPayload',
    'toSafeLocalDateStr',
    script
  )(
    () => ({}),
    () => ({}),
    {},
    {},
    {},
    {},
    {},
    {},
    () => '',
    buildRequestPayload,
    (value) => `local:${value}`
  )
  const vm = {
    ...component.data(),
    $t: (key) => key,
    $axios: { get },
    currentOrg: { id: 'org-1' },
    organizations: [{ id: 'org-1', name: 'Default' }]
  }
  Object.assign(
    vm,
    Object.fromEntries(
      Object.entries(component.methods).map(([key, method]) => [key, method.bind(vm)])
    )
  )
  for (const [key, getter] of Object.entries(component.computed)) {
    Object.defineProperty(vm, key, { get: getter.bind(vm) })
  }
  vm.selectedType = 'change_secret'
  vm.plugins = [
    {
      type: 'change_secret',
      fields: [
        { name: 'asset', resource: 'asset', type: 'string', required: true },
        { name: 'accounts', resource: 'account', type: 'list', required: true },
        { name: 'paths', type: 'list' }
      ]
    }
  ]
  await vm.configure()
  return vm
}

test('account picker resets with asset/organization and ignores obsolete requests', async () => {
  const requests = []
  const vm = await createAccountForm((url, config) => {
    if (url.includes('/workflows/')) return Promise.resolve([])
    return new Promise((resolve) => requests.push({ url, config, resolve }))
  })
  const form = { ...vm.initial }
  const update = (value) => Object.assign(form, value)
  const accounts = vm.fieldsMeta.param_accounts
  assert.deepEqual(form.param_accounts, [])
  assert.equal(accounts.el.disabled, true)
  assert.equal(vm.fieldsMeta.param_paths.el.type, 'textarea')
  assert.equal(vm.fieldsMeta.param_paths.helpText, 'TicketOneItemPerLine')
  assert.equal(accounts.helpTextFormatter(), 'TicketSelectAssetFirst')
  const first = vm.fieldsMeta.param_asset.on.change(['asset-1'], update)
  assert.equal(accounts.el.disabled, true)
  const second = vm.fieldsMeta.param_asset.on.change(['asset-2'], update)
  requests[1].resolve(['root', 'name,with,commas'])
  await second
  requests[0].resolve(['old-asset-account'])
  await first
  assert.deepEqual(
    accounts.el.options.map((item) => item.value),
    ['root', 'name,with,commas']
  )
  assert.equal(accounts.el.disabled, false)
  assert.equal(accounts.helpTextFormatter(), '')
  assert.deepEqual(requests[1].config.params, { org_id: 'org-1', asset: 'asset-2' })
  form.param_accounts = ['name,with,commas']
  assert.deepEqual(vm.cleanFormValue(form).request_data.accounts, ['name,with,commas'])
  const pending = vm.fieldsMeta.param_asset.on.change(['asset-3'], update)
  await vm.fieldsMeta.org_id.on.change(['org-2'], update)
  requests[2].resolve(['stale-org-account'])
  await pending
  assert.deepEqual(accounts.el.options, [])
  assert.deepEqual(form.param_accounts, [])
  assert.equal(accounts.el.disabled, true)
  assert.equal(vm.selectedOrgId, 'org-2')
})

test('empty or failed account loads cannot retain old selections and can be retried', async () => {
  let fail = true
  const vm = await createAccountForm(async (url) => {
    if (url.includes('/workflows/')) return []
    if (fail) throw new Error('Network error')
    return []
  })
  const form = { ...vm.initial, param_accounts: ['old-account'] }
  const update = (value) => Object.assign(form, value)
  await vm.loadAccountOptions('asset', update)
  assert.deepEqual(form.param_accounts, [])
  assert.equal(vm.accountsFailed, true)
  assert.equal(vm.fieldsMeta.param_accounts.el.disabled, false)
  assert.equal(vm.fieldsMeta.param_accounts.helpTextFormatter(), 'TicketAccountsLoadFailed')
  fail = false
  await vm.loadAccountOptions('asset', update)
  assert.equal(vm.accountsFailed, false)
  assert.equal(vm.fieldsMeta.param_accounts.helpTextFormatter(), 'TicketNoAssetAccounts')
  await vm.loadAccountOptions('', update)
  assert.equal(vm.fieldsMeta.param_accounts.el.disabled, true)
})

test('duration fields reuse validity translations and distinguish approval-only requests', async () => {
  const vm = await createAccountForm(async () => [])
  const duration = {
    name: 'duration',
    type: 'integer',
    label: 'Validity (seconds)',
    help_text: 'Plugin duration help',
    min: 60,
    max: 86400,
    default: 3600
  }
  for (const type of ['view_secret', 'download_replay', 'file_transfer', 'custom']) {
    vm.plugins.push({
      type,
      execution_mode: type === 'file_transfer' ? 'approval_only' : 'automatic',
      fields: [duration]
    })
    vm.selectedType = type
    await vm.configure()
    const meta = vm.fieldsMeta.param_duration
    assert.equal(meta.label, type === 'view_secret' ? 'TicketSecretDuration' : 'WFFieldValidity')
    assert.equal(
      meta.helpText,
      type === 'view_secret'
        ? 'TicketSecretDurationHelp'
        : type === 'download_replay'
          ? 'TicketReplayDurationHelp'
          : type === 'custom'
            ? duration.help_text
            : 'TicketApprovalDurationHelp'
    )
    assert.deepEqual(meta.el, { min: 60, max: 86400, precision: 0 })
    assert.equal(vm.initial.param_duration, 3600)
  }
})

test('session picker labels recordings but submits only the UUID and resets across organizations', async () => {
  const vm = await createAccountForm(async () => [])
  vm.plugins.push({
    type: 'download_replay',
    fields: [{ name: 'session', resource: 'session', type: 'string', required: true }]
  })
  vm.selectedType = 'download_replay'
  await vm.configure()
  const picker = vm.fieldsMeta.param_session
  assert.equal(picker.component, vm.fieldsMeta.org_id.component)
  assert.equal(picker.el.multiple, false)
  assert.equal(picker.el.disabled, false)
  assert.equal(picker.label, 'Session')
  assert.equal(picker.el.placeholder, 'TicketSelectSession')
  assert.equal(picker.helpText, 'TicketSelectSessionHelp')
  assert.equal(
    picker.el.ajax.url,
    '/api/v1/tickets/ticket-types/download_replay/options/?org_id=org-1'
  )
  const session = {
    id: 'f8ad3549-932f-46d7-8d52-c1943487b733',
    asset: 'Production database',
    account: 'root',
    user: 'alice',
    date_start: '2026-09-29T01:02:03Z'
  }
  const option = picker.el.ajax.transformOption(session)
  assert.equal(option.value, session.id)
  for (const text of [
    session.asset,
    session.account,
    session.user,
    `local:${session.date_start}`
  ]) {
    assert.ok(option.label.includes(text), `session label must include ${text}`)
  }
  const form = { ...vm.initial, param_session: option.value }
  assert.deepEqual(vm.cleanFormValue(form).request_data, { session: session.id })

  const update = (value) => Object.assign(form, value)
  form.org_id = 'org-2'
  await vm.fieldsMeta.org_id.on.change(['org-2'], update)
  assert.equal(form.param_session, '')
  assert.equal(vm.selectedOrgId, 'org-2')
  assert.equal(
    picker.el.ajax.url,
    '/api/v1/tickets/ticket-types/download_replay/options/?org_id=org-2'
  )
  form.param_session = 'bbf72d94-f00e-4134-af64-2c7349d0e687'
  assert.deepEqual(vm.cleanFormValue(form).request_data, { session: form.param_session })
  await vm.fieldsMeta.org_id.on.change([''], update)
  assert.equal(form.param_session, '')
  assert.equal(picker.el.disabled, true)
})
