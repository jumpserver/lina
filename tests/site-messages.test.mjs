import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse, compileTemplate } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/layout/components/NavHeader/SiteMessages.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename: 'SiteMessages.vue',
    id: 'messages'
  }).errors,
  []
)
const component = new Function(
  'Dialog',
  'MarkDown',
  'toSafeLocalDateStr',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, {}, String)

function createView() {
  const rows = Array.from({ length: 37 }, (_, i) => ({ id: String(i), has_read: i >= 31 }))
  const calls = []
  const view = {
    ...component.data(),
    $refs: { messageList: { scrollTo() {} } },
    $message(error) {
      assert.fail(error)
    },
    $axios: {
      async get(url, { params } = {}) {
        calls.push({ url, params })
        const filtered = params.has_read === false ? rows.filter((row) => !row.has_read) : rows
        return {
          count: filtered.length,
          results: structuredClone(filtered.slice(params.offset, params.offset + params.limit))
        }
      },
      async patch(url, body) {
        calls.push({ url, body })
        for (const row of rows) {
          if (!body.ids || body.ids.includes(row.id)) row.has_read = true
        }
      }
    }
  }
  for (const [key, method] of Object.entries(component.methods)) view[key] = method.bind(view)
  return { view, calls }
}

test('pages beyond the first 15 are accessible; reading the last page returns to the previous page', async () => {
  const { view, calls } = createView()
  await view.getMessages()
  assert.equal(view.messages.length, 15)
  assert.equal(view.unreadMsgCount, 31)
  assert.equal(calls[0].params.has_read, false)
  assert.ok(view.messages.every((row) => !row.has_read))
  await view.getMessages(2)
  assert.equal(view.messages[0].id, '15')
  assert.equal(calls.at(-1).params.offset, 15)
  await view.getMessages(3)
  assert.deepEqual(
    view.messages.map((row) => row.id),
    ['30']
  )
  await view.markAsRead(view.messages)
  assert.equal(view.currentPage, 2)
  assert.equal(view.unreadMsgCount, 30)
  assert.equal(view.messages.length, 15)
})

test('marking all unread messages read resets pagination to the empty first page', async () => {
  const { view } = createView()
  await view.getMessages(3)
  await view.markAsReadAll()
  assert.equal(view.currentPage, 1)
  assert.equal(view.unreadMsgCount, 0)
  assert.deepEqual(view.messages, [])
})

test('a slow response cannot overwrite a newer page', async () => {
  const { view } = createView()
  const pending = []
  view.$axios.get = () => new Promise((resolve) => pending.push(resolve))
  const oldRequest = view.getMessages(2)
  const newRequest = view.getMessages(1)
  pending[1]({ count: 1, results: [{ id: 'latest', has_read: false }] })
  await newRequest
  pending[0]({ count: 40, results: [{ id: 'unread', has_read: false }] })
  await oldRequest
  assert.deepEqual(view.messages, [{ id: 'latest', has_read: false }])
  assert.equal(view.unreadMsgCount, 1)
  assert.equal(view.currentPage, 1)
  assert.equal(view.loading, false)
})

test('failed loads clear loading and can be retried on the same page', async () => {
  const { view } = createView()
  const get = view.$axios.get
  view.$axios.get = async () => {
    throw new Error('offline')
  }
  await view.getMessages(2)
  assert.equal(view.loadFailed, true)
  assert.equal(view.loading, false)
  view.$axios.get = get
  await view.getMessages()
  assert.equal(view.loadFailed, false)
  assert.equal(view.messages[0].id, '15')
})
