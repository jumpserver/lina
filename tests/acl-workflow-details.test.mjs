import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

async function load(path) {
  const source = await readFile(new URL(`../src/views/acls/${path}`, import.meta.url), 'utf8')
  const script = parse(source).descriptor.script.content
    .replace(/^import .*$/gm, '').replace('export default', 'return')
  return new Function('AutoDetailCard', 'TwoCol', 'ChoicesFormatter', 'AccountLabelMapper', 'h', script)(
    {}, {}, {}, {}, () => {}
  )
}

const asset = await load('AssetLoginACL/AssetLoginAclDetail/Detail.vue')
const command = await load('CommandFilterACL/CommandFilterAcl/CommandFilterAclDetail/Detail.vue')
const login = await load('UserLoginACL/UserDetail/Detail.vue')
const context = (overrides = {}) => ({
  $t: (key) => key,
  object: {
    id: 'rule-id', workflow: 'workflow-id', workflow_name: 'Operations approval',
    action: { value: 'review', label: 'Review' }, review_enabled: true,
    reviewers: [{ name: 'Existing reviewer' }], command_groups: [], rules: { ip_group: [] },
    ...overrides
  }
})

function beforeConnection(vm) {
  return asset.computed.detailGroups.call(vm).find((group) => group.title === 'AclBeforeConnection').fields
}

test('asset approval shows the configured workflow instead of fixed reviewers', () => {
  const vm = context()
  assert.ok(beforeConnection(vm).includes('workflow_name'))
  assert.ok(!beforeConnection(vm).includes('reviewers'))
  assert.ok(beforeConnection(vm).includes('review_duration'))
  assert.equal(asset.data.call(vm).fieldsMeta.workflow_name.dependsOn, 'review_enabled')
})

test('asset rules retain fixed reviewers and hide approval details when approval is disabled', () => {
  const legacy = beforeConnection(context({ workflow: null }))
  assert.ok(legacy.includes('reviewers'))
  assert.ok(!legacy.includes('workflow_name'))
  const disabled = beforeConnection(context({ review_enabled: false }))
  for (const field of ['workflow_name', 'reviewers', 'review_duration']) assert.ok(!disabled.includes(field))
})

for (const [name, component, reviewerLabel] of [
  ['command', command, 'Reviewer'], ['login', login, 'LoginConfirmUser']
]) {
  test(`${name} rules show the workflow name and preserve fixed-reviewer fallback`, () => {
    const configured = component.data.call(context()).detailFields.filter(Boolean)
    assert.equal(configured.find((field) => field.key === 'WFWorkflows')?.value, 'Operations approval')
    assert.ok(!configured.some((field) => field.key === reviewerLabel))
    const legacy = component.data.call(context({ workflow: null })).detailFields.filter(Boolean)
    assert.equal(legacy.find((field) => field.key === reviewerLabel)?.value, 'Existing reviewer')
    assert.ok(!legacy.some((field) => field.key === 'WFWorkflows'))
    const missing = component.data.call(context({ workflow_name: '' })).detailFields.filter(Boolean)
    assert.equal(missing.find((field) => field.key === 'WFWorkflows')?.value, '-')
  })
}

test('non-review command rules do not show an approval workflow', () => {
  const fields = command.data.call(context({ action: { value: 'accept', label: 'Accept' } })).detailFields.filter(Boolean)
  assert.ok(!fields.some((field) => field.key === 'WFWorkflows' || field.key === 'Reviewer'))
})
