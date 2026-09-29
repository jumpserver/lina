import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

test('ticket request details translate session fields and format dates while preserving other values', async () => {
  const source = await readFile(
    new URL('../src/views/tickets/TicketDetail/TicketDetail.vue', import.meta.url),
    'utf8'
  )
  const translations = JSON.parse(
    await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8')
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const formattedDates = []
  const formatDate = (value) => {
    formattedDates.push(value)
    return value == null ? '-' : '2026-10-05 16:30:00'
  }
  // eslint-disable-next-line no-new-func -- Execute the local SFC script in this isolated test harness.
  const component = new Function('GenericTicketDetail', 'toSafeLocalDateStr', script)(
    {},
    formatDate
  )
  const accounts = ['root', 'operator']
  const date = '2026-10-05T08:30:00Z'
  const vm = {
    $t: (key) => translations[key],
    object: {
      request_items: [
        { name: 'duration', label: 'Validity (seconds)', value: 3600 },
        { name: 'session_asset', label: 'Session asset', value: 'Database server' },
        { name: 'session_account', label: 'Session account', value: 'root' },
        { name: 'session_user', label: 'Session user', value: 'Alice' },
        { name: 'session_date_start', label: 'Session start time', value: date },
        { name: 'session_date_start', label: 'Session start time', value: null },
        { name: 'accounts', label: 'Accounts', value: accounts },
        { name: 'ordinary', label: 'Custom label', value: 'Original text' },
        { name: 'number', label: 'Zero', value: 0 },
        { name: 'boolean', label: 'Disabled', value: false },
        { name: 'missing', label: 'Missing', value: null },
        { name: 'undefined', label: 'Undefined' }
      ]
    }
  }
  const items = component.computed.requestItems.call(vm)
  assert.deepEqual(items, [
    { key: '有效期（秒）', value: 3600 },
    { key: '资产', value: 'Database server' },
    { key: '账号', value: 'root' },
    { key: '用户', value: 'Alice' },
    { key: '开始日期', value: '2026-10-05 16:30:00' },
    { key: '开始日期', value: '-' },
    { key: 'Accounts', value: accounts },
    { key: 'Custom label', value: 'Original text' },
    { key: 'Zero', value: 0 },
    { key: 'Disabled', value: false },
    { key: 'Missing', value: '-' },
    { key: 'Undefined', value: '-' }
  ])
  assert.deepEqual(
    formattedDates,
    [date, null],
    'only session dates use the existing date formatter'
  )
  assert.strictEqual(
    items[6].value,
    accounts,
    'array values stay intact for the shared detail view'
  )
  assert.deepEqual(component.computed.requestItems.call({ ...vm, object: {} }), [])
})
