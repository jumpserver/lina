import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(
  new URL('../src/views/tickets/RequestAssetPerm/CreateUpdate.vue', import.meta.url),
  'utf8'
)
const helpersSource = await readFile(
  new URL('../src/views/perms/AssetPermission/expireSoonNotice.js', import.meta.url),
  'utf8'
)
const { normalizeExpireNoticePayload } = await import(
  `data:text/javascript;base64,${Buffer.from(helpersSource).toString('base64')}`
)
const body = source.match(/cleanFormValue: \(value\) => \{([\s\S]*?)\n      \},/)[1]
const clean = new Function('normalizeExpireNoticePayload', 'value', body).bind(
  { $t: (key) => (key === 'All' ? '全部' : key), validateAvailability() {} },
  normalizeExpireNoticePayload
)

function values(actions) {
  return {
    title: 'Keep this title',
    apply_actions: actions,
    apply_accounts: ['@ALL'],
    apply_assets: [],
    apply_nodes: [],
    workflow_id: 'workflow-id',
    apply_expire_soon_notice_switch: false,
    apply_expire_soon_notice_minutes: 15
  }
}

test('normalizing all actions does not mutate the array shared with the live form', () => {
  const formActions = ['全部']
  const payload = clean(values(formActions))
  assert.deepEqual(payload.apply_actions, ['all'])
  assert.deepEqual(formActions, ['全部'])
  assert.notEqual(payload.apply_actions, formActions)
  assert.equal(payload.title, 'Keep this title')
  assert.deepEqual(payload.apply_accounts, ['@ALL'])
  assert.equal(payload.apply_expire_soon_notice_minutes, null)
  for (const key of ['apply_assets', 'apply_nodes', 'apply_expire_soon_notice_switch']) {
    assert.equal(Object.hasOwn(payload, key), false)
  }
})

test('specific actions and enabled reminder values are preserved in the submitted payload', () => {
  const formActions = ['connect', 'download']
  const input = values(formActions)
  input.apply_expire_soon_notice_switch = true
  input.apply_expire_soon_notice_minutes = 30
  const payload = clean(input)
  assert.deepEqual(payload.apply_actions, ['connect', 'download'])
  assert.deepEqual(formActions, ['connect', 'download'])
  assert.equal(payload.apply_expire_soon_notice_minutes, 30)
  assert.equal(payload.workflow_id, 'workflow-id')
})
