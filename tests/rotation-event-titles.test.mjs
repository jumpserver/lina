import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { rotationEventTitle } from '../src/views/accounts/Integration/AccountRotationDetail/rotationEventTimeline.js'

const zh = JSON.parse(await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8'))
const source = { id: 'a', name: '主账号', username: 'app_a' }
const target = { id: 'b', name: '备用账号', username: 'app_b' }
const rotation_accounts = { source, target, change: source }
const title = (event) => {
  const { action, template, params } = rotationEventTitle(event)
  const text = zh[action] || action
  return template
    ? zh[template].replace(/\{(\w+)\}/g, (_, key) => ({ action: text, ...params })[key])
    : text
}

test('publication, rotation start and waiting explain distinct actions and the actual accounts', () => {
  assert.equal(title({
    event: 'credential.switch.published', rotation_accounts,
    account_switch: { from_account: source, to_account: target, reverting: false }
  }), '发布账号切换：主账号 (app_a) → 备用账号 (app_b)')
  assert.equal(title({ event: 'rotation.started', rotation_accounts }),
    '开始轮换：主账号 (app_a) → 备用账号 (app_b)')
  assert.equal(title({ event: 'rotation.waiting_for_app', rotation_accounts, published_account: target }),
    '等待应用切换：备用账号 (app_b)')
  assert.equal(title({ event: 'rotation.completed', rotation_accounts }),
    '完成轮换：主账号 (app_a) → 备用账号 (app_b)')
})

test('cancellation requests a return to the source account without reversing the original rotation', () => {
  assert.equal(title({
    event: 'credential.switch.published', rotation_accounts,
    account_switch: { from_account: target, to_account: source, reverting: true }
  }), '发布账号切回：备用账号 (app_b) → 主账号 (app_a)')
})

test('verification names the backup account while secret changes name the account being changed', () => {
  assert.equal(title({ event: 'rotation.verify.started', rotation_accounts }),
    '验证备用账号：备用账号 (app_b)')
  assert.equal(title({ event: 'credential.change.started', rotation_accounts }),
    '开始改密：主账号 (app_a)')
  assert.equal(title({ event: 'credential.change.completed', rotation_accounts }),
    '改密完成：主账号 (app_a)')
  assert.equal(title({ event: 'rotation.source.waiting', rotation_accounts }),
    '观察原主账号取密：主账号 (app_a)')
  assert.equal(title({
    event: 'credential.change.started', rotation_accounts, account: '主账号', account_id: 'a'
  }), '开始改密：主账号 (app_a)')
})

test('secret updates and refresh requests have distinct labels', () => {
  assert.equal(title({ event: 'credential.secret.updated' }), '账号凭据内容已更新')
  assert.equal(title({ event: 'rotation.started' }), '开始轮换')
  assert.equal(title({ event: 'credential.refresh.requested' }), '请求刷新当前凭据')
  assert.equal(title({ event: 'credential.secret.updated', rotation_accounts, published_account: source }),
    '账号凭据内容已更新：主账号 (app_a)')
})
