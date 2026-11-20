import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { approvalActionLabel } from '../src/views/acls/approval.js'

async function load(path) {
  const source = await readFile(new URL(`../src/views/acls/${path}`, import.meta.url), 'utf8')
  const script = parse(source).descriptor.script.content
    .replace(/^import .*$/gm, '').replace('export default', 'return')
  return new Function(
    'AutoDetailCard', 'TwoCol', 'ChoicesFormatter', 'AccountLabelMapper', 'h',
    'approvalActionLabel', 'IBox', 'DetailCard', 'getActionMeta', script
  )({}, {}, {}, {}, () => {}, approvalActionLabel, {}, {}, (data) => data)
}

const asset = await load('AssetLoginACL/AssetLoginAclDetail/Detail.vue')
const command = await load('CommandFilterACL/CommandFilterAcl/CommandFilterAclDetail/Detail.vue')
const login = await load('UserLoginACL/UserDetail/Detail.vue')
const autoDetail = await load('../../components/Cards/DetailCard/auto.vue')
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

async function visibleDetails(component, vm) {
  const config = component.data.call(vm)
  const card = {
    ...autoDetail.data(), ...autoDetail.methods,
    fields: config.detailFields, url: config.url, iObject: vm.object,
    formatters: {}, fieldsMeta: {},
    $store: { dispatch: async () => ({ name: { label: 'Name', type: 'string' } }) }
  }
  await autoDetail.mounted.call(card)
  assert.equal(card.loading, false)
  return autoDetail.computed.validItems.call(card)
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
  ['command', command, 'Reviewer'], ['login', login, 'Reviewer']
]) {
  test(`${name} rules show the workflow name and preserve fixed-reviewer fallback`, async () => {
    const configured = await visibleDetails(component, context())
    assert.equal(configured.find((field) => field.key === 'WFWorkflows')?.value, 'Operations approval')
    assert.ok(!configured.some((field) => field.key === reviewerLabel))
    const legacy = await visibleDetails(component, context({ workflow: null }))
    assert.equal(legacy.find((field) => field.key === reviewerLabel)?.value, 'Existing reviewer')
    assert.ok(!legacy.some((field) => field.key === 'WFWorkflows'))
    const missing = await visibleDetails(component, context({ workflow_name: '' }))
    assert.equal(missing.find((field) => field.key === 'WFWorkflows')?.value, '-')
  })
}

test('command workflows show required reviewers alongside the workflow name', async () => {
  const fields = await visibleDetails(command, context({ workflow_requires_reviewers: true }))
  assert.equal(fields.find((field) => field.key === 'WFWorkflows')?.value, 'Operations approval')
  assert.equal(fields.find((field) => field.key === 'Reviewer')?.value, 'Existing reviewer')
})

for (const action of ['accept', 'reject', 'warning', 'notify_and_warn']) {
  test(`${action} command details finish loading without approval fields`, async () => {
    const fields = await visibleDetails(command, context({
      action: { value: action, label: action }, workflow: null, reviewers: undefined
    }))
    assert.equal(fields.find((item) => item.key === 'Action')?.value, action)
    assert.ok(!fields.some((item) => item.key === 'WFWorkflows' || item.key === 'Reviewer'))
  })
}
