import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createI18n } from 'vue-i18n'

const messages = Object.fromEntries(
  await Promise.all(
    ['zh', 'zh_hant', 'en'].map(async (locale) => [
      locale,
      JSON.parse(
        await readFile(new URL(`../src/i18n/langs/${locale}.json`, import.meta.url), 'utf8')
      )
    ])
  )
)
const i18n = createI18n({ legacy: false, locale: 'zh', messages })

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
  const vm = { ...component.data(), object, requestItems: [], $emit: () => {}, $t: i18n.global.t }
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
    ...uploader.data.call({ modelValue: [], uploadedFiles: [] }),
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

test('transfer reminders disappear after execution or expiry and require applicant execution access', async () => {
  const source = await readFile(
    new URL('../src/views/tickets/components/TicketFileTransferResult.vue', import.meta.url),
    'utf8'
  )
  const paragraph = parse(source).descriptor.template.content.match(
    /<p[^>]*>\{\{ \$t\('TicketTransferExecutionHelp'\) \}\}<\/p>/
  )[0]
  const render = new Function(
    'Vue',
    compile(paragraph, { mode: 'function', prefixIdentifiers: true }).code
  )(Vue)
  const vm = mount(ticket())
  for (const [state, allowed] of [
    ['ready', true],
    ['pending', false],
    ['queued', false],
    ['running', false],
    ['success', false],
    ['failed', false],
    ['unverified', false],
    ['expired', false]
  ]) {
    vm.object.result.state = state
    const app = Vue.createSSRApp({ render, setup: () => ({ canExecute: vm.canExecute }) })
    app.config.globalProperties.$t = (key) => key
    const html = await renderToString(app)
    assert.equal(html.includes('TicketTransferExecutionHelp'), allowed, state)
  }
  vm.object.result.state = 'ready'
  vm.object.result.actions = []
  assert.equal(vm.canExecute, false)
  vm.object.result.actions = [{ type: 'execute_transfer' }]
  vm.object.result.expires_at = new Date(0).toISOString()
  assert.equal(vm.canExecute, false)
})

test('file paths appear once when the file table is populated and remain available without a table', () => {
  const vm = mount(ticket())
  vm.requestItems = [
    { name: 'asset', value: 'server' },
    { name: 'paths', value: ['C:\\Logs\\report.txt'] },
    { name: 'duration', value: 3600 }
  ]
  assert.deepEqual(vm.detailItems, vm.requestItems)
  vm.object.result.files = [{ name: 'report.txt', path: 'C:\\Logs\\report.txt' }]
  assert.deepEqual(
    vm.detailItems.map((item) => item.name),
    ['asset', 'duration']
  )
  assert.equal(vm.requestItems.length, 3)
  vm.object.result.files = []
  assert.deepEqual(vm.detailItems, vm.requestItems)
})

test('uploaded files retain names and sizes across direction remounts, including partial uploads', async () => {
  const uploader = await load('TicketTransferFiles')
  let ids = []
  let uploadedFiles = []
  const messages = []
  const file = { id: 'uploaded-a', name: 'report.txt', size: 12 }
  const mountUploader = () => {
    const props = { modelValue: ids, uploadedFiles, orgId: 'org-a' }
    const vm = {
      ...props,
      ...uploader.data.call(props),
      $t: (key) => key,
      $message: { error: (message) => messages.push(message) },
      $emit(event, value) {
        if (event === 'update:modelValue') ids = value
        if (event === 'files-change') uploadedFiles = value
      }
    }
    for (const [key, method] of Object.entries(uploader.methods)) vm[key] = method.bind(vm)
    return vm
  }
  let vm = mountUploader()
  let calls = 0
  vm.$axios = {
    async post() {
      if (++calls === 1) return file
      throw new Error('offline')
    }
  }
  await assert.rejects(
    vm.selectFiles({
      target: { files: [new File(['ok'], 'report.txt'), new File(['no'], 'other.txt')], value: '' }
    }),
    /offline/
  )
  assert.deepEqual(ids, ['uploaded-a'])
  assert.deepEqual(uploadedFiles, [file])
  assert.equal(vm.busy, false)
  uploader.beforeUnmount.call(vm)
  vm = mountUploader()
  assert.deepEqual(vm.files, [file])
  await vm.selectFiles({ target: { files: [new File(['duplicate'], 'report.txt')], value: '' } })
  assert.deepEqual(messages, ['TicketTransferFileSelectionError'])
  assert.deepEqual(vm.files, [file])
  vm.remove('uploaded-a')
  assert.deepEqual(ids, [])
  assert.deepEqual(uploadedFiles, [])
  uploader.beforeUnmount.call(vm)
  assert.deepEqual(mountUploader().files, [])
})

function completedTransfer(state, fileStates) {
  const object = ticket()
  object.result.state = state
  object.result.files = fileStates.map((state, index) => ({
    id: `file-${index}`,
    name: `file-${index}.log`,
    state
  }))
  object.result.actions = object.result.files
    .filter((file) => file.state === 'success')
    .map((file) => ({ type: 'download_transfer_file', file_id: file.id }))
  return mount(object)
}

test('partial success counts successful and failed files separately and keeps successful downloads', () => {
  const vm = completedTransfer('failed', ['success', 'success', 'failed'])
  assert.equal(vm.resultSummary, '部分成功：2 个成功，1 个失败')
  assert.equal(vm.resultHelp, '成功文件可下载。 请核对失败原因后重新申请，本次任务不会重试。')
  assert.equal(vm.canExecute, false)
  assert.match(vm.fileUrl(vm.result.files[0]), /download_transfer_file/)
  assert.equal(vm.fileUrl(vm.result.files[2]), '')
})

test('unverified results take precedence over partial success and are never counted as failures', () => {
  for (const [states, expected] of [
    [['success', 'success', 'unverified'], '传输结果待核验：2 个成功，1 个待核验'],
    [['success', 'failed', 'unverified'], '传输结果待核验：1 个成功，1 个失败，1 个待核验'],
    [['unverified', 'unverified'], '传输结果待核验：2 个待核验']
  ]) {
    const vm = completedTransfer('unverified', states)
    assert.equal(vm.resultSummary, expected)
    assert.equal(vm.fileCounts.failed, states.filter((state) => state === 'failed').length)
    assert.match(vm.resultHelp, /请先核对待核验文件的实际结果，再决定是否重新申请/)
    assert.equal(vm.canExecute, false)
    for (const file of vm.result.files.filter((file) => file.state === 'unverified'))
      assert.equal(vm.fileUrl(file), '')
  }
})

test('download guidance follows actual availability, expiry and transfer direction', () => {
  const vm = completedTransfer('failed', ['success', 'failed'])
  vm.object.result.expired = true
  assert.equal(vm.resultHelp.includes('成功文件可下载'), false)
  assert.equal(vm.fileUrl(vm.result.files[0]), '')
  vm.object.result.expired = false
  vm.object.result.actions = []
  assert.equal(vm.resultHelp.includes('成功文件可下载'), false)
  vm.object.result.direction = 'upload'
  vm.object.result.reviewable_files = ['file-0']
  assert.match(vm.fileUrl(vm.result.files[0]), /review_transfer_file/)
  assert.equal(vm.resultHelp.includes('成功文件可下载'), false)
})

test('all failures, missing file results and active transfers retain truthful summaries', () => {
  assert.equal(
    completedTransfer('failed', ['failed', 'failed']).resultSummary,
    '传输未完成：2 个失败'
  )
  assert.equal(completedTransfer('failed', []).resultSummary, '传输未完成')
  assert.equal(completedTransfer('unverified', []).resultSummary, '传输结果待核验')
  for (const state of [
    'pending',
    'ready',
    'queued',
    'running',
    'success',
    'expired',
    'unavailable'
  ]) {
    const vm = completedTransfer(state, ['success', 'pending'])
    assert.equal(vm.resultSummary, messages.zh['TicketTransferState_' + state])
    assert.equal(vm.resultHelp, '')
  }
})

test('summary and recovery messages render with no missing translations in all supported discussion locales', () => {
  for (const [locale, expected] of [
    ['zh', '部分成功：2 个成功，1 个失败'],
    ['zh_hant', '部分成功：2 個成功，1 個失敗'],
    ['en', 'Partially successful: 2 succeeded, 1 failed']
  ]) {
    const localized = createI18n({ legacy: false, locale, messages }).global
    const vm = completedTransfer('failed', ['success', 'success', 'failed'])
    vm.$t = localized.t
    assert.equal(vm.resultSummary, expected)
    vm.object.result.state = 'unverified'
    vm.object.result.files[2].state = 'unverified'
    assert.equal(vm.resultSummary.includes('TicketTransfer'), false)
    assert.equal(vm.resultHelp.includes('TicketTransfer'), false)
  }
})
