import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { parse } from '@vue/compiler-sfc'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

async function loadFileTransferOptions(store) {
  const source = await readFile(`${projectRoot}/src/views/ops/File/index.vue`, 'utf8')
  const { descriptor } = parse(source)
  const script = descriptor.script.content
    .replace(/^import .*$/gm, '')
    .replace('export default', 'const component =')
  const importNames = [
    'Term',
    'Page',
    'IBox',
    'createJob',
    'getTaskDetail',
    'JobUploadFile',
    'formatFileSize',
    'store',
    'SelectJobAssetDialog',
    'ConfirmRunAssetsDialog'
  ]
  const factory = new Function(...importNames, `${script}\nreturn component`)
  return factory(...importNames.map((name) => (name === 'store' ? store : () => {})))
}

test('file transfer requests upload-authorized account hints', async () => {
  const store = {
    getters: {
      currentOrgIsRoot: false,
      publicSettings: { FILE_UPLOAD_SIZE_LIMIT_MB: 100 }
    }
  }
  const component = await loadFileTransferOptions(store)
  const requests = []
  const context = {
    $axios: {
      post(url, data) {
        requests.push({ url, data })
        return Promise.resolve([])
      }
    },
    $hasPerm: () => true,
    $store: store,
    $t: (value) => value,
    $tc: (value) => value,
    getSelectedNodesAndHosts: () => ({ hosts: ['asset-id'], nodes: [] })
  }
  const data = component.data.call(context)

  data.runAsInput.el.query('', () => {})
  await Promise.resolve()

  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/api/v1/ops/username-hints/')
  assert.equal(requests[0].data.action, 'upload')
})
