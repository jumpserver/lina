import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import {
  attachmentAccept,
  attachmentSelectionError,
  ticketSubmitData
} from '../src/views/tickets/attachments.js'

async function component(name) {
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  const deps = {
    attachmentAccept,
    attachmentSelectionError,
    formatFileSize: String,
    toSafeLocalDateStr: String,
    IBox: {}
  }
  return new Function(...Object.keys(deps), script)(...Object.values(deps))
}
const file = (name = '证明.pdf', content = 'proof') => new File([content], name)

test('selection validates count, extension, empty files and exact size boundary', () => {
  assert.equal(attachmentSelectionError([file(), file('a.DOCX'), file('b.XLSX')]), '')
  assert.equal(
    attachmentSelectionError(Array.from({ length: 6 }, () => file())),
    'TicketAttachmentCountError'
  )
  assert.equal(attachmentSelectionError([file('a.svg')]), 'TicketAttachmentTypeError')
  assert.equal(attachmentSelectionError([file('a.pdf.exe')]), 'TicketAttachmentTypeError')
  assert.equal(attachmentSelectionError([file('a.pdf', '')]), 'TicketAttachmentSizeError')
  assert.equal(attachmentSelectionError([{ name: 'a.pdf', size: 10 * 1024 * 1024 }]), '')
  assert.equal(
    attachmentSelectionError([{ name: 'a.pdf', size: 10 * 1024 * 1024 + 1 }]),
    'TicketAttachmentSizeError'
  )
})

test('multipart submission preserves request types, original bytes and duplicate names', async () => {
  const payload = {
    type: 'apply_asset',
    title: '中文',
    request_data: { apply_accounts: ['root'], enabled: false },
    source_ticket_id: 'source'
  }
  assert.equal(ticketSubmitData(payload), payload)
  const body = ticketSubmitData(payload, [file(), file('证明.pdf', 'second')])
  assert.ok(body instanceof FormData)
  assert.deepEqual(JSON.parse(body.get('request_data')), payload.request_data)
  assert.equal(body.get('source_ticket_id'), 'source')
  assert.equal(body.get('title'), '中文')
  assert.deepEqual(await Promise.all(body.getAll('attachments').map((item) => item.text())), [
    'proof',
    'second'
  ])
  assert.deepEqual(
    body.getAll('attachments').map((item) => item.name),
    ['证明.pdf', '证明.pdf']
  )
})

test('uploader supports paste, remove and whole-selection rejection without mutating the draft', async () => {
  const upload = await component('TicketAttachmentUpload')
  const draft = [file()]
  const emitted = []
  const errors = []
  const vm = {
    ...upload.data(),
    modelValue: draft,
    disabled: false,
    $t: (key) => key,
    $emit: (...args) => emitted.push(args),
    $message: { error: (value) => errors.push(value) }
  }
  for (const [key, method] of Object.entries(upload.methods)) vm[key] = method.bind(vm)
  let prevented = false
  const pasted = new File(['png'], 'clipboard.png', { type: 'image/png' })
  vm.pasteFiles({
    clipboardData: { files: [pasted] },
    preventDefault: () => {
      prevented = true
    }
  })
  assert.equal(prevented, true)
  assert.deepEqual(emitted[0], ['update:modelValue', [draft[0], pasted]])
  assert.equal(draft.length, 1)
  emitted.length = 0
  vm.addFiles([file('bad.svg')])
  assert.deepEqual(errors, ['TicketAttachmentTypeError'])
  assert.equal(emitted.length, 0)
  vm.remove(0)
  assert.deepEqual(emitted[0], ['update:modelValue', []])
  emitted.length = 0
  vm.disabled = true
  vm.addFiles([file()])
  vm.remove(0)
  assert.equal(emitted.length, 0)
})

test('details expire files independently of ticket state and never revive deleted files', async () => {
  const details = await component('TicketAttachments')
  const vm = {
    now: Date.now(),
    object: { id: 'ticket', org_id: 'org', state: { value: 'pending' } }
  }
  const fresh = { id: 'file', expires_at: new Date(vm.now + 1000).toISOString(), expired: false }
  assert.equal(details.methods.isExpired.call(vm, fresh), false)
  assert.equal(details.methods.isExpired.call(vm, { ...fresh, expired: true }), true)
  vm.now += 1000
  assert.equal(details.methods.isExpired.call(vm, fresh), true)
  assert.match(
    details.methods.fileUrl.call(vm, fresh),
    /\/tickets\/ticket\/attachments\/file\/\?oid=org$/
  )
})
