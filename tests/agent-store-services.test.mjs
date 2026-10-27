import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL(
    '../src/views/accounts/Integration/ApplicationDetail/ApplicationAccessWizard.vue',
    import.meta.url
  ),
  'utf8'
)
const { descriptor } = parse(source)

function wizard(request = async () => ({ config: '{}' })) {
  const calls = []
  const component = new Function(
    'IBox',
    'Page',
    'Select2',
    'DataTable',
    'generateApplicationAccessMaterials',
    'toSafeLocalDateStr',
    'copy',
    descriptor.script.content.replace(/^import .*\n/gm, '').replace('export default', 'return')
  )(
    null,
    null,
    null,
    null,
    async (id, payload) => {
      calls.push({ id, payload: JSON.parse(JSON.stringify(payload)) })
      return request()
    },
    () => '',
    () => {}
  )
  const view = {
    ...component.data.call({ $t: (key) => key }),
    object: { id: 'application' },
    $refs: { form: { validate: async () => true } },
    $emit() {}
  }
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(view, name, { get: getter.bind(view) })
  return { view, calls }
}

test('business onboarding submits multiple aliases and independent service options', async () => {
  const { view, calls } = wizard()
  Object.assign(view.form, {
    type: 'agent',
    agent_setup: 'rotation',
    store_scope: 'selected',
    store_accounts: ['account-a'],
    service_name: 'database-app',
    update_on_notification: false,
    service_accounts: [
      {
        account_id: 'account-a',
        alias: 'database',
        username_field: 'DB_USER',
        secret_field: 'DB_PASSWORD'
      },
      {
        account_id: 'account-c',
        alias: 'cache',
        username_field: 'CACHE_USER',
        secret_field: 'CACHE_PASSWORD'
      }
    ]
  })
  await view.generate()
  const { payload } = calls[0]
  assert.equal(payload.allow_account_switch, true)
  assert.equal(payload.update_on_notification, false)
  assert.deepEqual(payload.store_accounts, ['account-a'])
  assert.equal(payload.service_accounts[1].alias, 'cache')
  assert.equal('account_id' in payload, false)
  assert.equal('delivery_mode' in payload, false)
  assert.equal(view.step, 1)
})

test('standard environment storage does not require a systemd business action', async () => {
  const { view, calls } = wizard()
  Object.assign(view.form, { type: 'agent', agent_setup: 'delivery', store_format: 'environment' })
  assert.equal(view.needsSystemd, false)
  await view.generate()
  assert.equal(calls[0].payload.service_accounts, undefined)
  assert.equal(calls[0].payload.systemd_unit, '')
})

test('account aliases remain unique after a row is removed and another is added', () => {
  const { view } = wizard()
  view.addServiceAccount()
  view.form.service_accounts.splice(0, 1)
  view.addServiceAccount()
  const accounts = view.form.service_accounts
  assert.notEqual(accounts[0].alias, accounts[1].alias)
  assert.notEqual(accounts[0].username_field, accounts[1].username_field)
})

test('nested account validation errors remain readable without advancing the wizard', async () => {
  const { view } = wizard(async () => {
    throw { response: { data: { service_accounts: [{ alias: ['Alias is required.'] }] } } }
  })
  view.form.type = 'agent'
  await view.generate()
  assert.equal(view.errors.service_accounts, 'Alias is required.')
  assert.equal(view.step, 0)
  assert.equal(view.generating, false)
})
