import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { nextTick, reactive, watch } from 'vue'

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
class FakeWebSocket {
  static instances = []

  constructor(url) {
    this.url = url
    FakeWebSocket.instances.push(this)
  }

  receive(data) {
    this.onmessage({ data: JSON.stringify(data) })
  }
}

const component = new Function(
  'Dialog',
  'MarkDown',
  'toSafeLocalDateStr',
  'WebSocket',
  'document',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)({}, {}, String, FakeWebSocket, {
  location: { protocol: 'https:', hostname: 'jumpserver.example', port: '' }
})

function createView() {
  const rows = Array.from({ length: 37 }, (_, i) => ({ id: String(i), has_read: i >= 31 }))
  const calls = []
  const view = reactive({
    ...component.data(),
    $nextTick: nextTick,
    $log: { debug() {} },
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
  })
  for (const [key, method] of Object.entries(component.methods)) view[key] = method.bind(view)
  watch(() => view.msgDetailVisible, component.watch.msgDetailVisible.bind(view))
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

function popup(id) {
  return {
    id,
    has_read: false,
    date_created: '2026-10-14T00:00:00Z',
    content: {
      subject: '安装升级提醒',
      message: '系统将在 10 分钟后开始安装升级，请及时保存当前操作。',
      display_mode: 'popup'
    }
  }
}

function connectMessages(view) {
  view.enablePullMsgCount()
  return FakeWebSocket.instances.at(-1)
}

test('Core display pushes open the popup; unread counts remain independent', () => {
  const { view, calls } = createView()
  const ws = connectMessages(view)
  assert.equal(ws.url, 'wss://jumpserver.example/ws/notifications/site-msg/')
  ws.receive({ type: 'unread_count', unread_count: 2 })
  assert.equal(view.unreadMsgCount, 2)
  assert.equal(view.msgDetailVisible, false)

  ws.receive({ type: 'display', site_msg: popup('upgrade') })
  assert.equal(view.msgDetailVisible, true)
  assert.equal(view.currentMsg.content.subject, '安装升级提醒')
  assert.equal(view.unreadMsgCount, 2)
  assert.equal(calls.length, 0)
})

test('ordinary, read, and malformed display pushes do not open a popup', () => {
  const { view } = createView()
  const ws = connectMessages(view)
  for (const msg of [
    undefined,
    {},
    { ...popup('ordinary'), content: { ...popup('ordinary').content, display_mode: '' } },
    { ...popup('read'), has_read: true },
    { ...popup('missing-content'), content: null },
    { ...popup('invalid-content'), content: { display_mode: 'popup' } }
  ]) {
    ws.receive({ type: 'display', site_msg: msg })
  }
  ws.receive({ type: 'unread_count', site_msg: popup('wrong-type'), unread_count: 0 })
  assert.equal(view.msgDetailVisible, false)
  assert.deepEqual(view.pendingPopupMessages, [])
})

test('duplicate pushes do not reopen dismissed popups or duplicate queued messages', async () => {
  const { view } = createView()
  const ws = connectMessages(view)
  for (const id of ['first', 'first', 'second', 'second']) {
    ws.receive({ type: 'display', site_msg: popup(id) })
  }
  assert.equal(view.currentMsg.id, 'first')
  assert.deepEqual(
    view.pendingPopupMessages.map((msg) => msg.id),
    ['second']
  )
  await nextTick()
  view.cancelRead()
  await nextTick()
  await nextTick()
  assert.equal(view.currentMsg.id, 'second')
  assert.equal(view.msgDetailVisible, true)

  view.cancelRead()
  await nextTick()
  await nextTick()
  ws.receive({ type: 'display', site_msg: popup('first') })
  ws.receive({ type: 'display', site_msg: popup('second') })
  assert.equal(view.msgDetailVisible, false)
  assert.deepEqual(view.pendingPopupMessages, [])
})

test('popups wait for a manually opened message to close', async () => {
  const { view } = createView()
  view.showMsgDetail({ ...popup('manual'), content: { subject: '站内信', message: '正文' } })
  const ws = connectMessages(view)
  ws.receive({ type: 'display', site_msg: popup('upgrade') })
  assert.equal(view.currentMsg.id, 'manual')
  await nextTick()
  view.cancelRead()
  await nextTick()
  await nextTick()
  assert.equal(view.currentMsg.id, 'upgrade')
  assert.equal(view.msgDetailVisible, true)
})

test('reading a popup sends its ID and advances to the next queued message', async () => {
  const { view, calls } = createView()
  const ws = connectMessages(view)
  ws.receive({ type: 'display', site_msg: popup('first') })
  ws.receive({ type: 'display', site_msg: popup('second') })
  await view.markAsRead([view.currentMsg])
  await nextTick()
  assert.deepEqual(calls[0], {
    url: '/api/v1/notifications/site-messages/mark-as-read/',
    body: { ids: ['first'] }
  })
  assert.equal(view.currentMsg.id, 'second')
  assert.equal(view.msgDetailVisible, true)
})

test('a delayed read response cannot close a newer popup', async () => {
  const { view } = createView()
  const ws = connectMessages(view)
  ws.receive({ type: 'display', site_msg: popup('first') })
  let finishRead
  view.$axios.patch = () =>
    new Promise((resolve) => {
      finishRead = resolve
    })
  const reading = view.markAsRead([view.currentMsg])
  view.msgDetailVisible = false
  await nextTick()
  await nextTick()
  ws.receive({ type: 'display', site_msg: popup('second') })
  finishRead()
  await reading
  assert.equal(view.currentMsg.id, 'second')
  assert.equal(view.msgDetailVisible, true)
})

test('marking all read clears queued popups', async () => {
  const { view } = createView()
  const ws = connectMessages(view)
  ws.receive({ type: 'display', site_msg: popup('first') })
  ws.receive({ type: 'display', site_msg: popup('second') })
  await view.markAsReadAll()
  await nextTick()
  assert.equal(view.msgDetailVisible, false)
  assert.deepEqual(view.pendingPopupMessages, [])
})
