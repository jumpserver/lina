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
    buildRequestPayload
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

test('only password-view duration gets a localized label and explanation', async () => {
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
  for (const type of ['view_secret', 'file_transfer']) {
    vm.plugins.push({ type, fields: [duration] })
    vm.selectedType = type
    await vm.configure()
    const meta = vm.fieldsMeta.param_duration
    assert.equal(meta.label, type === 'view_secret' ? 'TicketSecretDuration' : duration.label)
    assert.equal(
      meta.helpText,
      type === 'view_secret' ? 'TicketSecretDurationHelp' : duration.help_text
    )
    assert.deepEqual(meta.el, { min: 60, max: 86400, precision: 0 })
    assert.equal(vm.initial.param_duration, 3600)
  }
})
