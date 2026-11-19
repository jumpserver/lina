import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(new URL('../src/views/ops/File/index.vue', import.meta.url), 'utf8')
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'const component =')
const store = {
  getters: { currentOrgIsRoot: false, publicSettings: { FILE_UPLOAD_SIZE_LIMIT_MB: 100 } }
}
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function setup(overrides = {}) {
  const calls = { cancel: [], uploads: [], output: [] }
  const imports = {
    Term: {},
    Page: {},
    IBox: {},
    SelectJobAssetDialog: {},
    ConfirmRunAssetsDialog: {},
    store,
    createJob: async () => ({ id: 'job-1' }),
    getTaskDetail: async () => ({}),
    formatFileSize: String,
    JobUploadFile: (form, config) => {
      calls.uploads.push({ form, config })
      return new Promise((resolve, reject) =>
        config.signal.addEventListener('abort', () => {
          reject(Object.assign(new Error('cancelled'), { code: 'ERR_CANCELED' }))
        })
      )
    },
    cancelFileUpload: async (id) => {
      calls.cancel.push(id)
      return { cancelled: true }
    },
    ...overrides
  }
  const component = new Function(...Object.keys(imports), `${script}; return component`)(
    ...Object.values(imports)
  )
  const vm = {
    $store: store,
    $hasPerm: () => true,
    $t: String,
    $tc: String,
    $message: { error: () => {} },
    xterm: { write: (text) => calls.output.push(text) },
    $refs: { upload: { clearFiles: () => assert.fail('Must not clear a running upload') } }
  }
  Object.assign(vm, component.data.call(vm))
  for (const [name, fn] of Object.entries(component.methods)) vm[name] = fn.bind(vm)
  vm.uploadFileList = [
    { name: 'one.txt', raw: new Blob(['one']) },
    { name: 'two.txt', raw: new Blob(['two']) }
  ]
  vm.setCostTimeInterval = () => {
    calls.started = true
  }
  vm.writeExecutionOutput = () => {
    calls.started = true
  }
  return { vm, calls }
}

test('stop aborts the multipart upload and waits for server confirmation', async () => {
  const cancel = deferred()
  const { vm, calls } = setup({ cancelFileUpload: () => cancel.promise })
  const run = vm.onConfirmRunAsset(['asset'])
  await Promise.resolve()
  assert.equal(calls.uploads[0].form.getAll('files').length, 2)
  assert.deepEqual(calls.uploads[0].form.getAll('job_id'), ['job-1'])
  const stop = vm.stopTransfer()
  assert.equal(calls.uploads[0].config.signal.aborted, true)
  assert.equal(vm.running, true)
  assert.equal(vm.transferCancelled, false)
  cancel.resolve({ cancelled: true })
  await Promise.all([run, stop])
  assert.equal(vm.transferCancelled, true)
  assert.equal(vm.running, false)
  assert.equal(vm.showProgress, false)
  assert.equal(calls.started, undefined)
})

test('stop during job creation prevents upload and cancels the returned job', async () => {
  const create = deferred()
  const { vm, calls } = setup({ createJob: () => create.promise })
  const run = vm.onConfirmRunAsset(['asset'])
  await vm.stopTransfer()
  create.resolve({ id: 'late-job' })
  await run
  assert.deepEqual(calls.cancel, ['late-job'])
  assert.equal(calls.uploads.length, 0)
  assert.equal(vm.transferCancelled, true)
})

test('job creation failure while stopping restores controls', async () => {
  const create = deferred()
  const { vm } = setup({ createJob: () => create.promise })
  const run = vm.onConfirmRunAsset(['asset'])
  await vm.stopTransfer()
  create.reject(new Error('creation failed'))
  await run
  assert.equal(vm.running, false)
  assert.equal(vm.stopping, false)
  assert.equal(vm.transferCancelled, false)
})

test('late upload success cannot restart a cancelled transfer', async () => {
  const upload = deferred()
  const { vm, calls } = setup({ JobUploadFile: () => upload.promise })
  const run = vm.onConfirmRunAsset(['asset'])
  await Promise.resolve()
  await vm.stopTransfer()
  upload.resolve({ task_id: 'late-task' })
  await run
  assert.equal(vm.currentTaskId, '')
  assert.equal(vm.running, false)
  assert.equal(calls.started, undefined)
})

test('stop after upload cancels the server job, including its asset transfer', async () => {
  const { vm, calls } = setup({ JobUploadFile: async () => ({ task_id: 'task-1' }) })
  await vm.onConfirmRunAsset(['asset'])
  assert.equal(vm.currentTaskId, 'task-1')
  await vm.stopTransfer()
  assert.equal(vm.executionInfo.status, '')
  assert.deepEqual(calls.cancel, ['job-1'])
  assert.equal(vm.transferCancelled, true)
  assert.equal(vm.running, false)
})

test('failed cancellation stays retryable without reporting success', async () => {
  let attempts = 0
  const { vm } = setup({
    cancelFileUpload: async () => {
      if (++attempts === 1) throw new Error('offline')
      return { cancelled: true }
    }
  })
  const run = vm.onConfirmRunAsset(['asset'])
  await Promise.resolve()
  await vm.stopTransfer()
  assert.equal(vm.transferCancelled, false)
  assert.equal(vm.running, true)
  assert.equal(vm.stopping, false)
  await vm.stopTransfer()
  await run
  assert.equal(vm.transferCancelled, true)
  assert.equal(attempts, 2)
})

test('file removal and duplicate submissions are blocked during transfer', async () => {
  const { vm, calls } = setup()
  const run = vm.onConfirmRunAsset(['asset'])
  await Promise.resolve()
  vm.removeFile(vm.uploadFileList[0])
  vm.clearAllFiles()
  await vm.onConfirmRunAsset(['asset'])
  assert.equal(vm.uploadFileList.length, 2)
  assert.equal(calls.uploads.length, 1)
  await vm.stopTransfer()
  await run
})

test('an already completed transfer is not reported as cancelled', async () => {
  const { vm } = setup({
    JobUploadFile: async () => ({ task_id: 'task-1' }),
    cancelFileUpload: async () => ({ cancelled: false, task_id: 'task-1' })
  })
  let refreshed = false
  vm.getTaskStatus = () => {
    refreshed = true
  }
  await vm.onConfirmRunAsset(['asset'])
  await vm.stopTransfer()
  assert.equal(vm.transferCancelled, false)
  assert.equal(vm.running, false)
  assert.equal(refreshed, true)
})
