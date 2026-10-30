import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(new URL('../src/views/tickets/const.js', import.meta.url), 'utf8')
const formatTicketUser = new Function(
  'i18n',
  `${source.replace(/^import .*$/gm, '').replaceAll('export ', '')}; return formatTicketUser`
)({ t: (key) => key })

test('reviewer snapshots display once and preserve historical identities', () => {
  for (const [snapshot, expected] of [
    [{ name: '一级审核人', username: 'migration2' }, '一级审核人 (migration2)'],
    [{ name: '一级审核人(migration2)', username: 'migration2' }, '一级审核人(migration2)'],
    [{ name: '一级审核人 (migration2)', username: 'migration2' }, '一级审核人 (migration2)'],
    [{ display: '原审批人(old)', name: '已改名', username: 'new' }, '原审批人(old)'],
    [{ display: '已删除审批人(old)' }, '已删除审批人(old)'],
    [{ name: 'Name (department)', username: 'ops' }, 'Name (department) (ops)'],
    [{ name: 'ops', username: 'ops' }, 'ops'],
    [{ username: 'ops' }, 'ops'],
    [{}, '-'],
    [null, '-']
  ]) {
    const original = structuredClone(snapshot)
    assert.equal(formatTicketUser(snapshot), expected)
    assert.deepEqual(snapshot, original)
  }
})

test('approval nodes and activity use the same snapshot formatting', async () => {
  for (const file of ['WorkflowPanel', 'TicketActivity']) {
    const source = await readFile(
      new URL(`../src/views/tickets/components/${file}.vue`, import.meta.url),
      'utf8'
    )
    const script = parse(source).descriptor.script.content
    const method = script.match(/formatUser\(user\) \{([\s\S]*?)\n    \}/)[1]
    const format = new Function('formatTicketUser', 'user', method)
    assert.equal(
      format(formatTicketUser, { display: '原审批人(old)', name: 'New', username: 'new' }),
      '原审批人(old)'
    )
  }
})
