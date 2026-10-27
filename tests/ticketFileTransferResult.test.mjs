import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'

const commonSource = await readFile(
  new URL('../src/utils/common/index.js', import.meta.url),
  'utf8'
)
const formatSource = commonSource.match(/export function formatFileSize\(bytes\) \{[\s\S]*?\n\}/)[0]
const formatFileSize = new Function(
  formatSource.replace('export ', '') + '\nreturn formatFileSize'
)()

async function load(name, bindings = {}) {
  bindings = { formatFileSize, ...bindings }
  const source = await readFile(
    new URL(`../src/views/tickets/components/${name}.vue`, import.meta.url),
    'utf8'
  )
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'return')
  return new Function(...Object.keys(bindings), script)(...Object.values(bindings))
}
const component = await load('TicketFileTransferResult', {
  Details: {},
  TicketFileTransferAccess: {},
  useDateTime: () => ({})
})
function mount(object) {
  const vm = { ...component.data(), object, $emit: () => {} }
  for (const [key, method] of Object.entries(component.methods)) vm[key] = method.bind(vm)
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(vm, key, { get: getter.bind(vm) })
  return vm
}
function ticket() {
  return {
    id: 'ticket',
    org_id: 'org',
    result: {
      version: 2,
      state: 'ready',
      direction: 'download',
      expires_at: new Date(Date.now() + 60000).toISOString(),
      actions: [{ type: 'execute_transfer' }]
    }
  }
}
test('execution uses only a server action and disables duplicates and expired approvals', async () => {
  const vm = mount(ticket())
  const calls = []
  let done
  vm.$axios = {
    post: (url, data) => {
      calls.push({ url, data })
      return new Promise((resolve) => {
        done = resolve
      })
    }
  }
  const first = vm.execute()
  await vm.execute()
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].data, {})
  done()
  await first
  vm.object.result.expires_at = new Date(0).toISOString()
  await vm.execute()
  assert.equal(calls.length, 1)
})
test('downloads and review links require the corresponding server-approved file identifier', () => {
  const vm = mount(ticket())
  assert.equal(vm.fileUrl({ id: 'file' }), '')
  vm.object.result.actions = [{ type: 'download_transfer_file', file_id: 'file' }]
  assert.match(vm.fileUrl({ id: 'file' }), /download_transfer_file/)
  assert.equal(vm.fileUrl({ id: 'other' }), '')
  vm.object.result.direction = 'upload'
  assert.equal(vm.fileUrl({ id: 'file' }), '')
  vm.object.result.reviewable_files = ['file']
  assert.match(vm.fileUrl({ id: 'file' }), /review_transfer_file/)
  vm.object.result.expired = true
  assert.equal(vm.fileUrl({ id: 'file' }), '')
})
test('an upload response from the previous organization cannot attach files to the new request', async () => {
  const uploader = await load('TicketTransferFiles')
  assert.ok(
    uploader.emits.includes('change'),
    'native file changes must not fall through to DataForm'
  )
  let resolve
  const emitted = []
  const vm = {
    ...uploader.data(),
    orgId: 'one',
    $emit: (...args) => emitted.push(args),
    $axios: {
      post: () =>
        new Promise((done) => {
          resolve = done
        })
    }
  }
  for (const [key, method] of Object.entries(uploader.methods)) vm[key] = method.bind(vm)
  const pending = vm.selectFiles({
    target: { files: [new File(['hello'], 'hello.txt')], value: 'file' }
  })
  vm.orgId = 'two'
  vm.reset()
  resolve({ id: 'old-file', name: 'hello.txt' })
  await pending
  assert.deepEqual(vm.files, [])
  assert.equal(
    emitted.some(([event, value]) => event === 'update:modelValue' && value.includes('old-file')),
    false
  )
})

test('upload selection and transfer results automatically format byte sizes', async () => {
  const uploader = await load('TicketTransferFiles')
  const sizes = [
    [0, '0 Bytes'],
    [512, '512 Bytes'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1024 ** 2, '1 MB'],
    [1.25 * 1024 ** 2, '1.25 MB'],
    [1024 ** 3, '1 GB'],
    [1.5 * 1024 ** 3, '1.5 GB']
  ]
  for (const view of [uploader, component]) {
    for (const [bytes, expected] of sizes) {
      assert.equal(view.methods.formatFileSize(bytes), expected)
    }
  }
})
