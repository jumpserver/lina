import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import lodash from 'lodash'

const source = await readFile(
  new URL('../src/views/tickets/components/TicketAdjustmentDiff.vue', import.meta.url),
  'utf8'
)
const zh = JSON.parse(await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8'))
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const component = new Function('isEqual', 'useDateTime', 'AccountLabelMapper', script)(
  lodash.isEqual,
  () => ({}),
  { '@ALL': zh.AllAccounts, '@SPEC': zh.SpecAccount, '@INPUT': zh.ManualAccount }
)
function diff(before, after, options = {}) {
  const vm = {
    change: { before, after },
    items: [],
    snapshot: {},
    $t: (key) => zh[key] || key,
    toSafeLocalDateStr: (value) =>
      new Date(Date.parse(value) + 8 * 3600000).toISOString().slice(0, 19).replace('T', ' '),
    ...options
  }
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  return component.computed.rows.call(vm)
}

test('only meaningful changes appear; ordering, timezone and empty representations do not add rows', () => {
  const before = Object.freeze({
    apply_assets: Object.freeze(['b', 'a']),
    apply_accounts: Object.freeze(['root', 'ops']),
    apply_actions: 3,
    apply_date_start: '2026-10-28T08:30:00Z',
    apply_nodes: [],
    extra: null,
    duration: 60
  })
  const after = {
    apply_assets: ['a', 'b'],
    apply_accounts: ['ops', 'root'],
    apply_actions: ['upload', 'connect'],
    apply_date_start: '2026-10-28T16:30:00+08:00',
    apply_nodes: null,
    extra: '',
    duration: 120
  }
  assert.deepEqual(diff(before, after), [
    { name: 'duration', label: '有效期（秒）', before: '60', after: '120' }
  ])
  assert.deepEqual(before.apply_assets, ['b', 'a'])
})

test('stored action masks, account selectors and timestamps become readable comparison cells', () => {
  const rows = diff(
    { apply_accounts: ['@ALL'], apply_actions: 127, apply_date_expired: '2026-11-04T08:30:00Z' },
    { apply_accounts: ['ops'], apply_actions: 1, apply_date_expired: '2026-10-29T08:30:00Z' }
  )
  assert.deepEqual(rows, [
    { name: 'apply_accounts', label: '账号', before: '所有账号', after: 'ops' },
    { name: 'apply_actions', label: '动作', before: '全部', after: '连接' },
    {
      name: 'apply_date_expired',
      label: '失效日期',
      before: '2026-11-04 16:30:00',
      after: '2026-10-29 16:30:00'
    }
  ])
  assert.deepEqual(diff({ apply_actions: 127 }, { apply_actions: ['all'] }), [])
  assert.deepEqual(
    diff({ apply_actions: 1 }, { apply_actions: [{ value: 'connect', label: 'Connect' }] }),
    []
  )
})

test('resource names come from matching snapshots; missing historical resources retain their IDs', () => {
  const rows = diff(
    { apply_assets: ['old-asset'], apply_nodes: [], asset: 'unknown' },
    { apply_assets: ['new-asset'], apply_nodes: ['node'], asset: 'new-asset' },
    {
      snapshot: {
        assets: [{ id: 'new-asset', name: 'Ubuntu', address: '192.0.2.10' }],
        nodes: [{ id: 'node', full_value: '/DEFAULT/Linux' }]
      }
    }
  )
  assert.equal(rows[0].before, 'old-asset')
  assert.equal(rows[0].after, 'Ubuntu (192.0.2.10)')
  assert.equal(rows[1].before, '-')
  assert.equal(rows[1].after, '/DEFAULT/Linux')
  assert.equal(rows[2].before, 'unknown')
})

test('added and removed values, disabled notices and zero remain distinguishable', () => {
  const rows = diff(
    { accounts: ['root'], apply_expire_soon_notice_minutes: null, zero: 0 },
    { accounts: [], apply_expire_soon_notice_minutes: 30, duration: 600 }
  )
  assert.deepEqual(
    rows.map(({ before, after }) => [before, after]),
    [
      ['root', '-'],
      ['已禁用', '30 分钟'],
      ['0', '-'],
      ['-', '600']
    ]
  )
  assert.deepEqual(diff(null, undefined), [])
})

test('long lists and unknown values are preserved instead of being silently dropped or mislabeled', () => {
  const accounts = Array.from({ length: 100 }, (_, i) => `account-${i}`)
  const rows = diff(
    { accounts: [], apply_actions: 1 },
    { accounts, apply_actions: 129, custom: { value: 'raw', label: 'Readable' } },
    { items: [{ name: 'custom', label: '自定义项' }] }
  )
  assert.equal(rows[0].after.split('\n').length, 100)
  assert.equal(rows[0].after.split('\n')[99], 'account-99')
  assert.equal(rows[1].after, '连接、128')
  assert.equal(rows[2].label, '自定义项')
  assert.equal(rows[2].after, 'Readable')
  assert.equal(
    diff({}, { apply_accounts: ['toString', '!root', '@INPUT'] })[0].after,
    'toString\n排除账号: root\n手动账号'
  )
})

test('all new comparison labels are available in Simplified Chinese, Traditional Chinese and English', async () => {
  for (const locale of ['en', 'zh', 'zh_hant']) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/i18n/langs/${locale}.json`, import.meta.url), 'utf8')
    )
    for (const key of [
      'TicketAdjustRequest',
      'TicketAdjustmentDiff',
      'TicketAdjustmentField',
      'TicketAdjustmentBefore',
      'TicketAdjustmentAfter',
      'TicketAdjustmentNoChanges'
    ]) {
      assert.ok(messages[key], `${locale}: ${key}`)
    }
  }
})
