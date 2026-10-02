import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(new URL('../src/components/Apps/AccountCreateUpdateForm/const.js', import.meta.url), 'utf8')
const dependencies = ['ResourceSelect', 'NodeSelect', 'UpdateToken', 'UploadSecret', 'Select2', 'Required', 'RequiredChange', 'AutomationParamsForm']
const accountFieldsMeta = new Function(...dependencies,
  source.replace(/^import .*$/gm, '').replace(/export const /g, 'const ') + '\nreturn accountFieldsMeta'
)(...dependencies.map(() => ({})))

function createFields() {
  const vm = {
    $t: (key) => key,
    account: { name: 'user', source: 'template', source_id: 'template-id', follow_template: true },
    followingTemplate: true,
    addTemplate: false,
    isDisabled: false
  }
  return { vm, fields: accountFieldsMeta(vm) }
}

test('independent fields remain editable while following a template', () => {
  const { vm, fields } = createFields()
  assert.equal(fields.secret_type.el.disabled, false)
  assert.equal(fields.name.el.disabled, false)
  assert.equal(fields.privileged.el.disabled, false)
  fields.follow_template.on.change([false])
  assert.equal(vm.account.follow_template, true, 'do not mutate the saved account before submitting')
  assert.equal(fields.username.el.disabled, true, 'usernames remain immutable')
})

test('credential inputs hide while following and reappear when unchecked', () => {
  const { fields } = createFields()
  assert.equal(fields.secret_type.hidden({ follow_template: true }), true)
  assert.equal(fields.secret_type.hidden({ follow_template: false }), false)
  assert.equal(fields.passphrase.hidden({ secret_type: 'ssh_key', follow_template: true }), true)
  assert.equal(fields.passphrase.hidden({ secret_type: 'ssh_key', follow_template: false }), false)
  for (const secretType of ['password', 'ssh_key', 'token', 'access_key', 'api_key']) {
    assert.equal(fields[secretType].hidden({ secret_type: secretType, follow_template: true }), true)
    assert.equal(fields[secretType].hidden({ secret_type: secretType, follow_template: false }), false)
  }
})
