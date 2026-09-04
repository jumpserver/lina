import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { effect, reactive, stop } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

// Exercise route inheritance and the same permission path used by detail header actions.
const routeSource = await readFile(
  new URL('../src/router/pam/integrations.js', import.meta.url),
  'utf8'
)
const applicationRoutes = new Function(
  'empty',
  'i18n',
  routeSource.replace(/^import .*\n/gm, '').replace('export default', 'return')
)({}, { t: (key) => key })
const applicationRouter = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/pam/integrations', children: applicationRoutes }]
})
let grantedPerms = []
const permissionSource = await readFile(
  new URL('../src/utils/jms/permission.js', import.meta.url),
  'utf8'
)
const permissions = new Function(
  'getStore',
  permissionSource.replace(/^import .*\n/gm, '').replaceAll('export ', '') +
    '\nreturn { hasPermission, getResourceNameByPath }'
)(() => ({ getters: { currentOrgPerms: grantedPerms } }))
const routePermissionSource = await readFile(
  new URL('../src/utils/jms/index.js', import.meta.url),
  'utf8'
)
const routePermissionFunctions = ['getResourceFromRoute', 'getRouteRequiredPerms']
  .map((name) =>
    routePermissionSource
      .match(new RegExp(`export function ${name}\\([\\s\\S]*?^}`, 'm'))[0]
      .replace('export ', '')
  )
  .join('\n')
const getRouteRequiredPerms = new Function(
  'getResourceNameByPath',
  routePermissionFunctions + '\nreturn getRouteRequiredPerms'
)(permissions.getResourceNameByPath)
const permissionComposable = await readFile(
  new URL('../src/composables/usePermission.js', import.meta.url),
  'utf8'
)
const hasCurrentResAction = new Function(
  'getRouteRequiredPerms',
  'hasPermission',
  permissionComposable.replace(/^import .*\n/gm, '').replaceAll('export ', '') +
    '\nreturn hasCurrentResAction'
)(getRouteRequiredPerms, permissions.hasPermission)
for (const path of ['/pam/integrations/services', '/pam/integrations/services/application-id']) {
  const route = applicationRouter.resolve(path)
  for (const action of ['change', 'delete']) {
    grantedPerms = [`accounts.${action}_integrationapplication`]
    assert.equal(
      hasCurrentResAction(route, action),
      true,
      `${path}: authorized ${action} must be enabled`
    )
    grantedPerms = ['accounts.view_integrationapplication']
    assert.equal(
      hasCurrentResAction(route, action),
      false,
      `${path}: read-only users cannot ${action}`
    )
  }
}

const source = await readFile(
  new URL('../src/api/applicationCredential.js', import.meta.url),
  'utf8'
)
const calls = []
const request = {
  post: async (url, data) => {
    calls.push({ url, data })
    return { id: 'credential', type: { value: 'rotation' }, status: { value: 'idle' }, ...data }
  },
  patch: async (url, data) => request.post(url, data)
}
const api = new Function(
  'request',
  source.replace(/^import request.*\n/, '').replaceAll('export ', '') +
    '\nreturn { choiceValue, saveApplicationCredential, saveClientAccessConfiguration, advanceApplicationCredentialRotation, normalizeAccessConfiguration }'
)(request)

await api.saveApplicationCredential({
  name: 'fixed',
  type: 'fixed',
  account_id: 'account',
  is_active: true
})
assert.equal(calls.at(-1).url, '/api/v1/accounts/application-credentials/')
assert.equal(calls.at(-1).data.primary_account, 'account')
assert.equal(calls.at(-1).data.backup_account, null)
assert.equal(calls.at(-1).data.rotation_mode, '')

for (const [status, action] of Object.entries({
  idle: 'start',
  waiting_backup: 'check-usage',
  ready_for_change: 'change-secret',
  changing_secret: 'check-secret-change',
  waiting_primary: 'complete'
})) {
  await api.advanceApplicationCredentialRotation({ id: 'credential', status })
  assert.equal(calls.at(-1).url, `/api/v1/accounts/application-credentials/credential/${action}/`)
}

const config = api.normalizeAccessConfiguration({
  type: { value: 'agent' },
  language: { value: 'python' },
  is_active: false,
  credentials: [{ id: 'credential' }],
  application: { name: 'Application' },
  online_instances_amount: 1
})
assert.equal(config.type, 'agent')
assert.equal(config.status, 'disabled')
assert.deepEqual(config.credential_ids, ['credential'])

const clientAccessPage = await readFile(
  new URL(
    '../src/views/accounts/Integration/ApplicationDetail/ClientAccessPrototype.vue',
    import.meta.url
  ),
  'utf8'
)
assert.match(
  clientAccessPage,
  /<Drawer\b[\s\S]*?v-model:visible="formVisible"[\s\S]*?<ClientAccessCreateUpdate\b[\s\S]*?<\/Drawer>/
)
assert.doesNotMatch(clientAccessPage, /viewMode\s*(?:===|=)\s*'form'/)
assert.doesNotMatch(clientAccessPage, /ClientAccessConfigurationsHelp|client-access-toolbar/)
assert.match(clientAccessPage, /configurationTable\?\.reloadTable\(\)/)
assert.doesNotMatch(clientAccessPage, /inline-view-header|BackToList|showList|credential-tags/)
assert.doesNotMatch(clientAccessPage, /<IBox[^>]*ApplicationCredentials/)
const connectionItems = new Function(
  'BASE_URL',
  `return ({${clientAccessPage.match(/    connectionItems\(\) \{[\s\S]*?\n    \},/)[0]}}).connectionItems`
)('http://localhost')
for (const credentials of [
  [],
  [
    { name: 'first', key: 'key-1' },
    { name: 'second', key: 'key-2' }
  ]
]) {
  const items = connectionItems.call({
    selectedConfiguration: { credentials },
    object: {},
    $t: (key) => key,
    formatDate: () => '-'
  })
  assert.equal(
    items.find((item) => item.key === 'ApplicationCredentials').value,
    credentials.map((item) => `${item.name} · ${item.key}`).join('\n')
  )
}
assert.match(
  clientAccessPage,
  /<Drawer\b[^>]*v-model:visible="materialsVisible"[^>]*@closed="clearMaterials"[\s\S]*?configurationText[\s\S]*?executionText[\s\S]*?<\/Drawer>/
)
const materialRequests = []
let materialResult
const accessMethods = new Function(
  'generateClientAccessMaterials',
  `return ${clientAccessPage.match(/  methods: (\{[\s\S]*\n  \})\n\}\n<\/script>/)[1]}`
)(async (id) => {
  materialRequests.push(id)
  if (materialResult instanceof Error) throw materialResult
  return materialResult
})
const materialVm = {
  ...accessMethods,
  canGenerate: true,
  generating: false,
  materialsVisible: false,
  selectedConfiguration: { id: 'configuration' },
  $t: (key) => key,
  $confirm: async () => {},
  $message: { success() {} }
}
for (const type of ['sdk', 'agent']) {
  materialResult = {
    type,
    config: type === 'sdk' ? { secret: 'test-only' } : null,
    code: 'sdk example',
    install_command: 'install example'
  }
  await materialVm.generateMaterials()
  assert.equal(materialRequests.at(-1), 'configuration')
  assert.equal(materialVm.materialsVisible, true)
  assert.equal(materialVm.generated, true)
  assert.equal(materialVm.generating, false)
  assert.equal(materialVm.executionText, type === 'sdk' ? 'sdk example' : 'install example')
  materialVm.clearMaterials()
  assert.equal(materialVm.generated, false)
  for (const field of ['configurationText', 'executionText', 'installCommand']) {
    assert.equal(materialVm[field], '')
  }
}
materialVm.materialsVisible = false
materialVm.$confirm = async () => {
  throw new Error('cancel')
}
await materialVm.generateMaterials()
assert.equal(materialVm.materialsVisible, false)
assert.equal(materialRequests.length, 2)
materialVm.$confirm = async () => {}
materialResult = new Error('request failed')
await assert.rejects(() => materialVm.generateMaterials(), /request failed/)
assert.equal(materialVm.generating, false)
assert.equal(materialVm.generated, false)
assert.equal(materialVm.configurationText, '')

const credentialPage = await readFile(
  new URL('../src/views/accounts/Integration/AccountRotationPrototype.vue', import.meta.url),
  'utf8'
)
for (const page of [clientAccessPage, credentialPage]) {
  assert.doesNotMatch(page, /hasRightActions: false|hasSearch: false/)
  assert.match(page, /hasImport: false/)
  assert.match(page, /hasExport: false/)
  assert.match(page, /searchConfig: \{\s*getUrlQuery: false/)
  assert.match(
    page,
    /<ListTable\b[^>]*:header-actions="headerActions"[^>]*:table-config="tableConfig"/
  )
  assert.match(page, /onCreate: this\.openCreate/)
  assert.doesNotMatch(page, /@click="openCreate"/)
  assert.doesNotMatch(
    page.match(/<Drawer\b[^>]*>/)?.[0] || '',
    /\s:?size=/,
    'Application forms must use the shared Drawer width, not a page-specific override'
  )
}
const credentialDetail = await readFile(
  new URL('../src/views/accounts/Integration/AccountRotationDetail/index.vue', import.meta.url),
  'utf8'
)
assert.equal((credentialDetail.match(/<ListTable\b/g) || []).length, 2)
assert.doesNotMatch(credentialDetail, /<DataTable|hasRightActions: false|hasSearch: false/)
assert.match(credentialDetail, /hasLeftActions: false/)
assert.match(credentialDetail, /hasImport: false/)
assert.match(credentialDetail, /hasExport: false/)
assert.equal(
  (credentialDetail.match(/columnsMeta: \{ actions: \{ has: false \} \}/g) || []).length,
  2
)
assert.match(credentialDetail, /name: 'ApplicationCredentialAccess'/)
const relatedMethods = new Function(
  `return ${credentialDetail.match(/  methods: (\{[\s\S]*\n  \})\n\}\n<\/script>/)[1]}`
)()
const relatedVm = {
  object: { id: 'credential-2' },
  accessTableConfig: { extraQuery: { credentials: 'credential-1' } },
  historyTableConfig: { extraQuery: { credential: 'credential-1' } },
  $nextTick: async () => {},
  $refs: {
    accessTable: { reloadTable() {} },
    historyTable: { reloadTable() {} }
  }
}
await relatedMethods.loadRelatedData.call(relatedVm)
assert.deepEqual(relatedVm.accessTableConfig.extraQuery, { credentials: 'credential-2' })
assert.deepEqual(relatedVm.historyTableConfig.extraQuery, { credential: 'credential-2' })
assert.doesNotMatch(credentialPage, /credential-toolbar|toolbar-actions/)
assert.doesNotMatch(credentialPage, /#search-after|<el-input|typeFilter|hasSearch: false/)
assert.match(credentialPage, /searchConfig: \{\s*getUrlQuery: false/)
assert.match(credentialPage, /credentialTable\.reloadTable\(\)/)
const leaveCredentialPage = new Function(
  `return function() {${credentialPage.match(/  deactivated\(\) \{([\s\S]*?)\n  \},/)[1]}}`
)()
const leavingPage = { drawerVisible: true }
leaveCredentialPage.call(leavingPage)
assert.equal(leavingPage.drawerVisible, false)

// Evaluate the real action configuration without invoking APIs or changing business data.
const credentialInfo = await readFile(
  new URL(
    '../src/views/accounts/Integration/AccountRotationDetail/AccountRotationInfo.vue',
    import.meta.url
  ),
  'utf8'
)
const rotationMethods = new Function(
  'advanceApplicationCredentialRotation',
  `return ${credentialInfo.match(/  methods: (\{[\s\S]*\n  \})\n\}\n<\/script>/)[1]}`
)(async (credential) => ({ ...credential, status: 'changing_secret' }))
for (const rotation_mode of ['single', 'dual']) {
  const routes = []
  const vm = {
    ...rotationMethods,
    object: { id: 'credential', status: 'ready_for_change', rotation_mode },
    $hasPerm: () => true,
    $router: { push: async (route) => routes.push(route) },
    $emit: () => {},
    $message: { success() {} },
    $t: (key) => key
  }
  await vm.advanceRotation()
  assert.deepEqual(routes, [
    {
      name: 'AccountChangeSecretCreate',
      query: { application_credential: 'credential' }
    }
  ])
  vm.$hasPerm = () => false
  await vm.advanceRotation()
  await vm.openChangeSecretForm()
  assert.equal(routes.length, 1)
}
const changeFormSource = await readFile(
  new URL(
    '../src/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue',
    import.meta.url
  ),
  'utf8'
)
const initializeChangeForm = new Function(
  'getApplicationCredential',
  'choiceValue',
  `return async function() {${changeFormSource.match(/  async created\(\) \{([\s\S]*?)\n  \},\n  watch:/)[1]}}`
)(
  async () => ({
    name: 'Credential',
    asset: { id: 'asset' },
    primary_account: { username: 'root', secret_type: 'password' }
  }),
  api.choiceValue
)
for (const routeName of ['AccountChangeSecretCreate', 'AccountChangeSecretUpdate']) {
  const vm = {
    $route: { name: routeName, query: { application_credential: 'credential' } },
    $t: (key) => key,
    initial: { is_periodic: false },
    fieldsMeta: { params: { el: {} } }
  }
  await initializeChangeForm.call(vm)
  assert.equal(vm.ready, true)
  if (routeName.endsWith('Create')) {
    assert.deepEqual(vm.initial.assets, ['asset'])
    assert.deepEqual(vm.initial.accounts, ['root'])
    assert.equal(vm.initial.name, 'Credential-ChangeSecret')
    assert.equal(vm.initial.secret_type, 'password')
    assert.equal(vm.initial.secret_strategy, 'random')
    assert.equal(vm.initial.check_conn_after_change, true)
    assert.equal(vm.initial.is_periodic, false)
    assert.deepEqual(vm.fieldsMeta.params.el.assets, ['asset'])
  } else {
    assert.deepEqual(vm.initial, { is_periodic: false })
  }
}
const actionVm = {
  $t: (key) => key,
  $hasPerm: () => true,
  actionLoading: false,
  openEdit: (row) => ['edit', row],
  remove: (row) => ['delete', row],
  toggleInstance: (row) => ['toggle', row],
  disableClient: (row) => ['disable', row]
}
const actionConfigs = [credentialPage, clientAccessPage, credentialInfo].flatMap((page) =>
  [
    ...page.matchAll(
      /prop: 'actions',[\s\S]*?formatter: ActionsFormatter,\s*formatterArgs: (\{[\s\S]*?\n            \})/g
    )
  ].map((match) => new Function(`return (${match[1]})`).call(actionVm))
)
assert.equal(actionConfigs.length, 4)
const [credentialActions, configurationActions, instanceActions, blockerActions] = actionConfigs
const idleRow = { id: 'credential', status: 'idle' }
for (const actions of [credentialActions, configurationActions]) {
  assert.equal(actions.hasClone, false)
  assert.equal(actions.canUpdate({ row: idleRow }), true)
  assert.equal(actions.canDelete({ row: idleRow }), true)
  assert.deepEqual(actions.onUpdate({ row: idleRow }), ['edit', idleRow])
  assert.deepEqual(actions.onDelete({ row: idleRow }), ['delete', idleRow])
}
assert.equal(credentialActions.canUpdate({ row: { status: 'waiting_backup' } }), false)
assert.equal(credentialActions.canDelete({ row: { status: 'changing_secret' } }), false)
const toggle = instanceActions.extraActions[0]
const disable = blockerActions.extraActions[0]
for (const is_active of [true, false]) {
  const row = { id: 'instance', is_active }
  assert.equal(toggle.title({ row }), is_active ? 'Disable' : 'Enable')
  assert.equal(toggle.icon({ row }), is_active ? 'fa-solid fa-ban' : 'fa-circle-check')
  assert.deepEqual(toggle.callback({ row }), ['toggle', row])
}
assert.deepEqual(disable.callback({ row: idleRow }), ['disable', idleRow])
assert.equal(disable.can(), true)
actionVm.actionLoading = true
assert.equal(disable.can(), false)
actionVm.$hasPerm = () => false
for (const actions of [credentialActions, configurationActions]) {
  assert.equal(actions.canUpdate({ row: idleRow }), false)
  assert.equal(actions.canDelete({ row: idleRow }), false)
}
assert.equal(toggle.can(), false)
assert.equal(disable.can(), false)

const credentialForm = await readFile(
  new URL('../src/views/accounts/Integration/AccountRotationCreateUpdate.vue', import.meta.url),
  'utf8'
)
assert.doesNotMatch(credentialForm, /<IBox\b[^>]*:title=/)
assert.doesNotMatch(clientAccessPage, /<IBox\b[^>]*:title="\$t\('ClientAccessConfiguration'\)"/)

async function createFormConfig(path, props = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  assert.match(source, /<GenericCreateUpdatePage\b[^>]*:title="null"/)
  assert.doesNotMatch(source, /<el-form\b|<style\b/)
  const script = source
    .match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default', 'return')
  const component = new Function(
    'GenericCreateUpdatePage',
    'Select2',
    'rules',
    'credentialUrl',
    'accessConfigurationUrl',
    'saveApplicationCredential',
    'saveClientAccessConfiguration',
    script
  )(
    {},
    {},
    { Required: { required: true }, RequiredChange: { required: true } },
    '/api/v1/accounts/application-credentials/',
    '/api/v1/accounts/client-access-configurations/',
    api.saveApplicationCredential,
    api.saveClientAccessConfiguration
  )
  const events = []
  const vm = reactive({
    ...props,
    $t: (key) => key,
    $context: { get: () => 'parent-application-id' },
    $message: { success() {} },
    $emit: (...args) => events.push(args)
  })
  Object.assign(vm, component.data.call(vm))
  return { config: vm.formConfig, events }
}

const credentialFormPath = '../src/views/accounts/Integration/AccountRotationCreateUpdate.vue'
const accessFormPath =
  '../src/views/accounts/Integration/ApplicationDetail/ClientAccessCreateUpdate.vue'
const { config: credentialCreate } = await createFormConfig(credentialFormPath)
assert.equal(credentialCreate.submitMethod, 'post')
assert.equal(credentialCreate.getUrl(), '/api/v1/accounts/application-credentials/')
assert.equal(credentialCreate.needGetObjectDetail, false)
const fields = credentialCreate.fieldsMeta
for (const [type, rotation_mode, dual] of [
  ['fixed', 'single', false],
  ['rotation', 'single', false],
  ['rotation', 'dual', true]
]) {
  const values = {
    ...credentialCreate.initial,
    type,
    rotation_mode,
    account_id: 'single',
    primary_account_id: 'primary',
    backup_account_id: 'backup'
  }
  assert.equal(fields.account_id.hidden(values), dual)
  assert.equal(fields.primary_account_id.hidden(values), !dual)
  assert.equal(fields.backup_account_id.hidden(values), !dual)
  await credentialCreate.performSubmit(values)
  assert.equal(calls.at(-1).data.primary_account, dual ? 'primary' : 'single')
  assert.equal(calls.at(-1).data.backup_account, dual ? 'backup' : null)
}
let update
let accountSelect
const observeAccount = effect(() => {
  accountSelect = { url: fields.account_id.el.url, disabled: fields.account_id.el.disabled }
})
fields.asset_id.on.change(['asset-2'], (value) => {
  update = value
})
assert.deepEqual(update, { account_id: '', primary_account_id: '', backup_account_id: '' })
assert.match(fields.account_id.el.url, /asset_id=asset-2/)
assert.equal(fields.account_id.el.disabled, false)
assert.match(accountSelect.url, /asset_id=asset-2/)
assert.equal(accountSelect.disabled, false)
stop(observeAccount)
fields.primary_account_id.on.change(['primary'])
assert.deepEqual(fields.backup_account_id.el.disabledValues, ['primary'])
fields.backup_account_id.rules[1].validator({}, 'primary', (error) => assert.ok(error))
fields.type.on.change(['fixed'], (value) => assert.deepEqual(value, { rotation_mode: 'single' }))

const { config: credentialEdit } = await createFormConfig(credentialFormPath, {
  credential: {
    id: 'credential-edit',
    type: 'rotation',
    rotation_mode: 'dual',
    asset: { id: 'asset' },
    primary_account: { id: 'primary' },
    backup_account: { id: 'backup' },
    is_active: false
  }
})
assert.equal(credentialEdit.initial.backup_account_id, 'backup')
assert.equal(credentialEdit.initial.is_active, false)
await credentialEdit.performSubmit(credentialEdit.initial)
assert.equal(calls.at(-1).url, '/api/v1/accounts/application-credentials/credential-edit/')

const { config: accessCreate, events } = await createFormConfig(accessFormPath, {
  application: { id: 'application' }
})
assert.equal(accessCreate.submitMethod, 'post')
assert.equal(accessCreate.getUrl(), '/api/v1/accounts/client-access-configurations/')
assert.equal(accessCreate.needGetObjectDetail, false)
for (const type of ['sdk', 'agent']) {
  assert.equal(accessCreate.fieldsMeta.language.hidden({ type }), type !== 'sdk')
  assert.equal(accessCreate.fieldsMeta.app_user.hidden({ type }), type !== 'agent')
  assert.equal(accessCreate.fieldsMeta.install_path.hidden({ type }), type !== 'agent')
  await accessCreate.performSubmit({
    ...accessCreate.initial,
    type,
    credential_ids: ['credential']
  })
  assert.equal(calls.at(-1).url, '/api/v1/accounts/client-access-configurations/')
  assert.equal(calls.at(-1).data.application, 'application')
  assert.deepEqual(calls.at(-1).data.credentials, ['credential'])
}
assert.deepEqual(events.slice(-2), [
  ['submitting', true],
  ['submitting', false]
])
accessCreate.moreButtons[0].callback()
assert.deepEqual(events.at(-1), ['cancel'])
let fieldErrors
accessCreate.onPerformError(
  { response: { status: 400, data: { credentials: ['Not authorized'] } } },
  'post',
  {
    $refs: {
      form: {
        setErrors: (errors) => {
          fieldErrors = errors
        }
      }
    }
  }
)
assert.deepEqual(fieldErrors.credential_ids, ['Not authorized'])

const { config: accessEdit } = await createFormConfig(accessFormPath, {
  application: { id: 'application' },
  configuration: {
    id: 'configuration-edit',
    type: 'agent',
    credential_ids: ['credential'],
    is_active: false
  }
})
assert.equal(accessEdit.fieldsMeta.type.el.disabled, true)
assert.equal(accessEdit.initial.is_active, false)
await accessEdit.performSubmit(accessEdit.initial)
assert.equal(calls.at(-1).url, '/api/v1/accounts/client-access-configurations/configuration-edit/')
console.log('Application credential HTTP, standard form, and layout checks passed')
