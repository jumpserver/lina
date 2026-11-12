import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import {
  credentialAssetLabels,
  subscribedAccountLabel
} from '../src/views/accounts/Integration/components/subscriptionAccount.js'

const source = await readFile(
  new URL('../src/views/accounts/Integration/AccountRotationCreateUpdate.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*\n/gm, '')
  .replace('export default', 'return')
const component = new Function(
  'GenericCreateUpdatePage',
  'Select2',
  'rules',
  'credentialUrl',
  'saveApplicationCredential',
  'subscribedAccountLabel',
  script
)(null, null, {}, '/policies/', () => {}, subscribedAccountLabel)

const first = {
  id: 'a',
  name: 'db-user',
  asset: { id: 'ha-1', name: 'mysql-1', address: '10.0.0.1' }
}
const second = {
  id: 'b',
  name: 'db-user',
  asset: { id: 'ha-2', name: 'mysql-2', address: '10.0.0.2' }
}
function form(credential = null) {
  const view = { credential, mode: 'alternating_rotation', $t: (key) => key }
  Object.assign(view, component.data.call(view))
  return view
}

test('applications precede accounts and accounts are disabled until an application is selected', () => {
  const { formConfig } = form()
  const fields = formConfig.fields.flatMap(([, fields]) => fields)
  assert.ok(fields.indexOf('application_ids') < fields.indexOf('account_id'))
  assert.equal(fields.includes('asset_id'), false)
  assert.equal(formConfig.fieldsMeta.account_id.el.disabled, true)
  assert.equal(formConfig.fieldsMeta.alternate_account_id.el.disabled, true)
})

test('changing multiple applications requests their account intersection and clears prior selections', () => {
  const { formConfig } = form()
  const meta = formConfig.fieldsMeta
  let update
  meta.application_ids.on.change([['app-1', 'app-2']], (values) => {
    update = values
  })
  assert.deepEqual(update, { account_id: '', alternate_account_id: '' })
  assert.equal(meta.account_id.el.disabled, false)
  assert.match(meta.account_id.el.url, /integrationapplications=app-1,app-2/)
  assert.equal(meta.account_id.el.url.includes('asset_id='), false)
  assert.equal(meta.alternate_account_id.el.url, meta.account_id.el.url)
  meta.application_ids.on.change([[]], () => {})
  assert.equal(meta.account_id.el.disabled, true)
  assert.equal(meta.account_id.el.url, '')
})

test('cross-asset warning follows both selections and clears for same-asset accounts', () => {
  const meta = form().formConfig.fieldsMeta
  for (const account of [first, second, { ...second, id: 'c', asset: first.asset }]) {
    const option = meta.account_id.el.ajax.transformOption(account)
    assert.ok(option.label.includes(account.asset.address))
  }
  meta.account_id.on.change([first.id])
  meta.alternate_account_id.on.change([second.id])
  assert.equal(meta.alternate_account_id.helpText, '!RotationCrossAssetWarning')
  meta.alternate_account_id.on.change(['c'])
  assert.equal(meta.alternate_account_id.helpText, '')
  meta.account_id.on.change([second.id])
  assert.equal(meta.alternate_account_id.helpText, '!RotationCrossAssetWarning')
  meta.account_id.on.change([''])
  assert.equal(meta.alternate_account_id.helpText, '')
})

test('editing preserves cross-asset selections, labels and warning', () => {
  const credential = {
    account: first,
    alternate_account: second,
    applications: [{ id: 'app-1' }]
  }
  const { formConfig } = form(credential)
  assert.equal(formConfig.initial.account_id, first.id)
  assert.equal(formConfig.initial.alternate_account_id, second.id)
  assert.equal(formConfig.fieldsMeta.alternate_account_id.helpText, '!RotationCrossAssetWarning')
  assert.deepEqual(credentialAssetLabels(credential), ['mysql-1(10.0.0.1)', 'mysql-2(10.0.0.2)'])
  assert.deepEqual(credentialAssetLabels({ ...credential, alternate_account: first }), [
    'mysql-1(10.0.0.1)'
  ])
})

const changeSecretSource = await readFile(
  new URL(
    '../src/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue',
    import.meta.url
  ),
  'utf8'
)
const changeSecretScript = parse(changeSecretSource)
  .descriptor.script.content.replace(/^import .*\n/gm, '')
  .replace('export default', 'return')

async function changeSecretForm(sourceAccount, assetId) {
  const credential = {
    id: 'policy-1',
    name: 'HA database',
    asset: first.asset,
    rotation: {
      id: 'rotation-1',
      change_account: { username: sourceAccount.id, secret_type: 'password', asset_id: assetId }
    }
  }
  const page = new Function(
    'GenericCreateUpdatePage',
    'getApplicationCredential',
    'choiceValue',
    changeSecretScript
  )(
    null,
    async () => credential,
    (value) => value
  )
  const view = {
    $route: {
      name: 'AccountChangeSecretCreate',
      query: { application_credential: credential.id, credential_rotation: credential.rotation.id }
    },
    $t: (key) => key,
    initial: {},
    fieldsMeta: { params: { el: {} } }
  }
  view.configurePamForm = page.methods.configurePamForm.bind(view)
  await page.created.call(view)
  return view
}

test('change secret form locks to the replaced account asset in both directions', async () => {
  for (const sourceAccount of [first, second]) {
    const view = await changeSecretForm(sourceAccount, sourceAccount.asset.id)
    assert.deepEqual(view.initial.assets, [sourceAccount.asset.id])
    assert.deepEqual(view.initial.accounts, [sourceAccount.id])
    assert.deepEqual(view.fieldsMeta.params.el.assets, view.initial.assets)
    assert.equal(view.fieldsMeta.assets.el.disabled, true)
  }
})

test('change secret form accepts legacy same-asset rotation responses', async () => {
  const view = await changeSecretForm(first)
  assert.deepEqual(view.initial.assets, [first.asset.id])
})
