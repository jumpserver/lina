import test from 'node:test'
import assert from 'node:assert/strict'
import { getTicketPlugin, configurePluginField } from '../src/views/tickets/plugins/registry.js'
import { reactive } from 'vue'
import resourceAvailability from '../src/views/tickets/plugins/resourceAvailability.js'
import { buildRequestPayload } from '../src/views/tickets/plugins/form.js'

test('direct entry falls back to an available organization before current organization is set', async () => {
  const vm = await createAccountForm(async () => [])
  vm.currentOrg = null
  await vm.configure()
  assert.equal(vm.initial.org_id, 'org-1')
  assert.equal(vm.selectedOrgId, 'org-1')
  assert.equal(vm.formReady, true)
})

test('boolean and multiple-choice fields keep their types through the generic form', async () => {
  const vm = await createAccountForm(async () => [])
  vm.plugins.push({
    type: 'example',
    fields: [
      { name: 'enabled', type: 'boolean', required: true },
      { name: 'scopes', type: 'multiple_choice', choices: [{ value: 'one', label: 'One' }] }
    ]
  })
  vm.selectedType = 'example'
  await vm.configure()
  assert.equal(vm.fieldsMeta.param_enabled.type, 'switch')
  assert.equal(vm.fieldsMeta.param_scopes.el.multiple, true)
  assert.equal(vm.initial.param_enabled, false)
  assert.deepEqual(vm.initial.param_scopes, [])
  assert.deepEqual(vm.cleanFormValue({ ...vm.initial, param_scopes: ['one'] }).request_data, {
    enabled: false,
    scopes: ['one']
  })
})

test('multiple account fields load independently and discard responses after organization changes', async () => {
  const requests = []
  const vm = await createAccountForm((url, config) => {
    if (url.includes('/workflows/')) return Promise.resolve([])
    return new Promise((resolve) => requests.push({ config, resolve }))
  })
  vm.plugins.push({
    type: 'example',
    fields: [
      { name: 'source', resource: 'asset', type: 'string' },
      { name: 'target', resource: 'asset', type: 'string' },
      { name: 'reader', resource: 'account', depends_on: 'source', type: 'string' },
      { name: 'writers', resource: 'account', depends_on: 'target', type: 'list', max_length: 2 }
    ]
  })
  vm.selectedType = 'example'
  await vm.configure()
  const values = { ...vm.initial }
  const update = (patch) => Object.assign(values, patch)
  const source = vm.fieldsMeta.param_source.on.change(['asset-a'], update)
  const target = vm.fieldsMeta.param_target.on.change(['asset-b'], update)
  assert.deepEqual(requests[0].config.params, {
    org_id: 'org-1',
    field: 'reader',
    source: 'asset-a'
  })
  assert.deepEqual(requests[1].config.params, {
    org_id: 'org-1',
    field: 'writers',
    target: 'asset-b'
  })
  requests[1].resolve(['writer'])
  requests[0].resolve(['reader'])
  await Promise.all([source, target])
  assert.equal(vm.fieldsMeta.param_reader.el.multiple, false)
  assert.equal(vm.fieldsMeta.param_writers.el.multipleLimit, 2)
  assert.deepEqual(vm.fieldsMeta.param_reader.el.options, [{ value: 'reader', label: 'reader' }])
  assert.deepEqual(vm.fieldsMeta.param_writers.el.options, [{ value: 'writer', label: 'writer' }])
  const stale = vm.fieldsMeta.param_source.on.change(['asset-c'], update)
  await vm.fieldsMeta.org_id.on.change(['org-2'], update)
  requests[2].resolve(['stale'])
  await stale
  assert.deepEqual(vm.fieldsMeta.param_reader.el.options, [])
  assert.deepEqual(vm.fieldsMeta.param_writers.el.options, [])
  assert.equal(values.param_reader, '')
  assert.deepEqual(values.param_writers, [])
})

test('a plugin requiring an unavailable custom form never exposes a partial generic form', async () => {
  const vm = await createAccountForm(async () => [])
  vm.plugins.push({ type: 'example', custom_form: true, fields: [] })
  vm.selectedType = 'example'
  await vm.configure()
  assert.equal(vm.formReady, false)
  assert.equal(vm.plugin.form, undefined)
})

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
    'getTicketPlugin',
    'configurePluginField',
    'getTicketTypeLabel',
    'buildRequestPayload',
    'toSafeLocalDateStr',
    'resourceAvailability',
    'BasicTree',
    'TicketTransferFiles',
    'TicketWorkflowSelect',
    script
  )(
    () => ({}),
    () => ({}),
    {},
    {},
    {},
    {},
    {},
    getTicketPlugin,
    configurePluginField,
    () => '',
    buildRequestPayload,
    (value) => `local:${value}`,
    resourceAvailability,
    {},
    {},
    {}
  )
  const vm = reactive({
    ...resourceAvailability.data(),
    ...component.data(),
    $t: (key) => key,
    $axios: { get },
    currentOrg: { id: 'org-1' },
    organizations: [{ id: 'org-1', name: 'Default' }]
  })
  Object.assign(
    vm,
    Object.fromEntries(
      Object.entries({ ...resourceAvailability.methods, ...component.methods }).map(
        ([key, method]) => [key, method.bind(vm)]
      )
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
        {
          name: 'accounts',
          resource: 'account',
          depends_on: 'asset',
          type: 'list',
          required: true
        },
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
  assert.equal(accounts.helpTextFormatter(), '')
  assert.equal(accounts.el.placeholder, 'TicketSelectAssetFirst')
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
  assert.equal(accounts.el.placeholder, accounts.label)
  assert.equal(accounts.helpTextFormatter(), '')
  assert.deepEqual(requests[1].config.params, {
    org_id: 'org-1',
    field: 'accounts',
    asset: 'asset-2'
  })
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
  assert.equal(accounts.el.placeholder, 'TicketSelectAssetFirst')
  assert.equal(accounts.helpTextFormatter(), '')
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
  await vm.loadAccountOptions(vm.accountFields[0], 'asset', update)
  assert.deepEqual(form.param_accounts, [])
  assert.equal(vm.accountStates.accounts.failed, true)
  assert.equal(vm.fieldsMeta.param_accounts.el.disabled, false)
  assert.equal(vm.fieldsMeta.param_accounts.helpTextFormatter(), 'TicketAccountsLoadFailed')
  fail = false
  await vm.loadAccountOptions(vm.accountFields[0], 'asset', update)
  assert.equal(vm.accountStates.accounts.failed, false)
  assert.equal(vm.fieldsMeta.param_accounts.helpTextFormatter(), 'TicketNoAssetAccounts')
  await vm.loadAccountOptions(vm.accountFields[0], '', update)
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
    '/api/v1/tickets/ticket-types/download_replay/options/?org_id=org-1&field=session'
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
    '/api/v1/tickets/ticket-types/download_replay/options/?org_id=org-2&field=session'
  )
  form.param_session = 'bbf72d94-f00e-4134-af64-2c7349d0e687'
  assert.deepEqual(vm.cleanFormValue(form).request_data, { session: form.param_session })
  await vm.fieldsMeta.org_id.on.change([''], update)
  assert.equal(form.param_session, '')
  assert.equal(picker.el.disabled, true)
})

test('file transfer form keeps path guidance on demand and preserves request payloads', async () => {
  const vm = await createAccountForm(async () => [])
  vm.plugins.push({
    type: 'file_transfer',
    execution_mode: 'automatic',
    fields: [
      {
        name: 'direction',
        type: 'choice',
        required: true,
        choices: [
          { value: 'upload', label: 'Server upload' },
          { value: 'download', label: 'Server download' }
        ]
      },
      { name: 'paths', type: 'list', required: true },
      { name: 'duration', type: 'integer', min: 60, max: 86400, default: 3600 }
    ]
  })
  vm.selectedType = 'file_transfer'
  await vm.configure()
  assert.equal(vm.fieldsMeta.param_paths.label, 'TicketTransferFilePath')
  assert.equal(vm.plugin.summary, undefined)
  assert.equal(vm.fieldsMeta.param_paths.helpText, '')
  assert.equal(vm.fieldsMeta.param_paths.helpTip, 'TicketTransferExactPathsHelp')
  assert.equal(vm.fieldsMeta.param_paths.el.placeholder, 'TicketTransferPathExample')
  assert.equal(vm.fieldsMeta.param_duration.helpText, 'TicketTransferExecutionDurationHelp')
  assert.deepEqual(vm.fieldsMeta.param_direction.el.options, [
    { value: 'upload', label: 'Upload' },
    { value: 'download', label: 'Download' }
  ])
  const payload = vm.cleanFormValue({
    ...vm.initial,
    param_direction: 'download',
    param_paths: '/var/log/a'
  })
  assert.equal(payload.request_data.direction, 'download')
  assert.deepEqual(payload.request_data.paths, ['/var/log/a'])
  assert.equal(payload.request_data.duration, 3600)
})

test('file transfer preserves each direction draft, submits only active fields and resets on organization changes', async () => {
  const vm = await createAccountForm(async () => [])
  vm.$t = (key, params) => (params ? `${key}:${params.action}` : key)
  vm.plugins.push({
    type: 'file_transfer',
    execution_mode: 'external',
    fields: [
      {
        name: 'direction',
        type: 'choice',
        required: true,
        choices: [{ value: 'upload' }, { value: 'download' }]
      },
      { name: 'files', type: 'list' },
      { name: 'paths', type: 'list', default: [] },
      { name: 'target_directory', type: 'string' },
      { name: 'duration', type: 'integer', min: 60, max: 86400, default: 3600 }
    ]
  })
  vm.selectedType = 'file_transfer'
  await vm.configure()
  const durationHelp = () => vm.fieldsMeta.param_duration.helpTextFormatter()
  assert.equal(vm.fieldsMeta.param_duration.helpText, '')
  assert.equal(durationHelp(), 'TicketTransferExecutionNextStep:TicketTransferExecuteUpload')
  const values = { ...vm.initial }
  const update = (patch) => Object.assign(values, patch)
  assert.equal(values.param_direction, 'upload')
  assert.equal(vm.fieldsMeta.param_files.hidden(), false)
  assert.equal(vm.fieldsMeta.param_files.helpText, '')
  assert.equal(vm.fieldsMeta.param_target_directory.helpText, '')
  assert.equal(vm.fieldsMeta.param_target_directory.helpTip, 'TicketTransferTargetHelp')
  assert.equal(
    vm.fieldsMeta.param_target_directory.el.placeholder,
    'TicketTransferDirectoryExample'
  )
  assert.equal(vm.fieldsMeta.param_paths.hidden(), true)
  const file = { id: 'file-a', name: 'report.txt', size: 12 }
  values.param_files = [file.id]
  values.param_target_directory = '/tmp/reports'
  values.param_paths = '/var/log/app.log'
  vm.fieldsMeta.param_files.on['files-change']([[file]])
  const uploadDraft = structuredClone(values)
  vm.fieldsMeta.param_files.on.busy([true])
  assert.equal(vm.fieldsMeta.param_direction.el.disabled, true)
  assert.equal(vm.fieldsMeta.param_direction.helpTextFormatter(), 'TicketTransferWaitDirection')
  values.param_direction = 'download'
  vm.fieldsMeta.param_direction.on.change(['download'], update)
  assert.equal(values.param_direction, 'upload')
  assert.equal(vm.transferDirection, 'upload')
  assert.equal(vm.transferUploading, true)
  assert.throws(() => vm.cleanFormValue(values), /TicketTransferWaitUpload/)
  vm.fieldsMeta.param_files.on.busy([false])
  assert.equal(vm.fieldsMeta.param_direction.el.disabled, false)
  assert.equal(vm.fieldsMeta.param_direction.helpTextFormatter(), '')
  values.param_direction = 'download'
  vm.fieldsMeta.param_direction.on.change(['download'], update)
  assert.equal(durationHelp(), 'TicketTransferExecutionNextStep:TicketTransferFetchFiles')
  assert.equal(vm.fieldsMeta.param_files.hidden(), true)
  assert.equal(vm.fieldsMeta.param_paths.hidden(), false)
  assert.deepEqual(values, { ...uploadDraft, param_direction: 'download' })
  const download = vm.cleanFormValue(values).request_data
  assert.deepEqual(download.paths, ['/var/log/app.log'])
  assert.equal('files' in download, false)
  assert.equal('target_directory' in download, false)
  values.param_direction = 'upload'
  vm.fieldsMeta.param_direction.on.change(['upload'], update)
  assert.equal(vm.fieldsMeta.param_files.hidden(), false)
  assert.equal(vm.fieldsMeta.param_paths.hidden(), true)
  assert.deepEqual(values, uploadDraft)
  assert.deepEqual(vm.fieldsMeta.param_files.el.uploadedFiles, [file])
  const upload = vm.cleanFormValue(values).request_data
  assert.deepEqual(upload.files, ['file-a'])
  assert.equal(upload.target_directory, '/tmp/reports')
  assert.equal('paths' in upload, false)
  assert.deepEqual(values, uploadDraft, 'submitting must not erase the other direction draft')
  await vm.fieldsMeta.org_id.on.change(['org-2'], update)
  assert.equal(vm.fieldsMeta.param_files.el.orgId, 'org-2')
  assert.equal(vm.transferDirection, 'upload')
  assert.equal(durationHelp(), 'TicketTransferExecutionNextStep:TicketTransferExecuteUpload')
  assert.equal(vm.transferUploading, false)
  assert.deepEqual(values.param_files, [])
  assert.deepEqual(values.param_paths, [])
  assert.equal(values.param_target_directory, '')
  assert.deepEqual(vm.fieldsMeta.param_files.el.uploadedFiles, [])
  const validate = (field, value) => {
    let error
    vm.fieldsMeta[field].rules[0].validator(null, value, (result) => {
      error = result
    })
    return error
  }
  assert.ok(validate('param_files', []))
  assert.ok(validate('param_target_directory', ''))
  assert.equal(validate('param_paths', ''), undefined)
})

test('failed workflow loads keep generic forms usable and retry changes only the workflow', async () => {
  const vm = await createAccountForm(async () => {
    throw new Error('offline')
  })
  assert.equal(vm.formReady, true)
  assert.equal(vm.workflowReady, false)
  assert.equal(vm.fieldsMeta.workflow_id.el.failed, true)
  const draft = {
    ...vm.initial,
    title: 'Keep this title',
    param_asset: 'asset-a',
    param_accounts: ['root']
  }
  const original = structuredClone(draft)
  let resolve
  vm.$axios.get = () =>
    new Promise((done) => {
      resolve = done
    })
  const retry = vm.fieldsMeta.workflow_id.on.retry([], (patch) => Object.assign(draft, patch))
  assert.equal(vm.fieldsMeta.workflow_id.el.loading, true)
  assert.equal(vm.workflowReady, false)
  resolve([
    { id: 'flow-a', name: 'A' },
    { id: 'flow-b', name: 'B' }
  ])
  await retry
  assert.equal(vm.workflowReady, true)
  assert.equal(vm.fieldsMeta.workflow_id.el.disabled, false)
  assert.deepEqual(draft, { ...original, workflow_id: 'flow-a' })

  const pending = []
  vm.$axios.get = () => new Promise((resolve, reject) => pending.push({ resolve, reject }))
  const old = vm.loadFlows('old-org')
  const current = vm.loadFlows('current-org')
  pending[0].reject(new Error('offline'))
  assert.equal(await old, undefined)
  assert.equal(vm.fieldsMeta.workflow_id.el.loading, true)
  assert.equal(vm.fieldsMeta.workflow_id.el.failed, false)
  pending[1].resolve([])
  assert.equal(await current, null)
  assert.equal(vm.workflowReady, false)
  assert.equal(vm.fieldsMeta.workflow_id.el.loading, false)
})

test('reapply hydrates resource labels, original workflow and file paths without uploading old files', async () => {
  const vm = await createAccountForm(async () => [])
  vm.$route = { query: { source_ticket: 'old', oid: 'org-1' } }
  const source = {
    type: 'change_secret',
    org_id: 'org-1',
    title: 'Reuse this',
    comment: 'Purpose',
    workflow_id: 'flow-old',
    source_ticket: { id: 'old' },
    warnings: [],
    request_data: {
      asset: 'asset-1',
      accounts: ['root'],
      paths: ['/tmp/a,b', 'C:\\reports\\a.txt']
    },
    resources: { asset: [{ id: 'asset-1', name: 'Server', address: '127.0.0.1' }] }
  }
  vm.$axios.get = async (url) =>
    url.includes('/actions/')
      ? source
      : url.includes('/workflows/')
        ? [
            { id: 'first', name: 'First' },
            { id: 'flow-old', name: 'Original' }
          ]
        : ['root']
  await vm.configure()
  assert.equal(vm.formReady, true)
  assert.equal(vm.initial.title, 'Reuse this')
  assert.equal(vm.initial.workflow_id, 'flow-old')
  assert.equal(vm.initial.param_paths, '/tmp/a,b\nC:\\reports\\a.txt')
  assert.deepEqual(vm.initial.param_accounts, ['root'])
  assert.deepEqual(vm.fieldsMeta.param_asset.el.options, [
    { value: 'asset-1', label: 'Server (127.0.0.1)' }
  ])
  assert.equal(vm.cleanFormValue(vm.initial).source_ticket_id, 'old')
  source.type = 'file_transfer'
  vm.plugins.push({
    type: 'file_transfer',
    fields: [
      { name: 'direction', type: 'choice', choices: [{ value: 'upload' }, { value: 'download' }] },
      { name: 'paths', type: 'list' },
      { name: 'files', type: 'list' },
      { name: 'target_directory', type: 'string' }
    ]
  })
  vm.selectedType = 'file_transfer'
  Object.assign(source.request_data, { direction: 'download', files: ['old-file'] })
  await vm.configure()
  assert.equal(vm.transferDirection, 'download')
  assert.equal(vm.fieldsMeta.param_paths.hidden(), false)
  assert.equal(vm.fieldsMeta.param_files.hidden(), true)
  assert.deepEqual(vm.initial.param_files, [])
  source.request_data.direction = 'upload'
  await vm.configure()
  assert.equal(vm.fieldsMeta.param_files.hidden(), false)
  assert.deepEqual(vm.initial.param_files, [])
})

test('failed or mismatched reapply cannot silently open a blank submittable form', async () => {
  const vm = await createAccountForm(async () => [])
  vm.$route = { query: { source_ticket: 'old' } }
  vm.$axios.get = async () => {
    throw new Error('Denied')
  }
  await vm.configure()
  assert.equal(vm.loadError, true)
  assert.equal(vm.formReady, false)
  vm.$axios.get = async () => ({ type: 'file_transfer' })
  await vm.configure()
  assert.equal(vm.loadError, true)
  assert.equal(vm.formReady, false)
})
