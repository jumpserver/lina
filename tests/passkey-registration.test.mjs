import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { setImmediate } from 'node:timers/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'
import passkey from '../src/utils/passkey.js'

const source = await readFile(new URL('../src/views/profile/PassKey.vue', import.meta.url), 'utf8')
const script = parse(source).descriptor.script.content
  .replace(/^import .*$/gm, '')
  .replace('export default', 'const component =')
const { code } = transformSync(script, { loader: 'jsx' })
const load = new Function(
  'GenericListPage', 'Dialog', 'AutoDataForm', 'passkey', 'getErrorResponseMsg', 'location', 'navigator',
  `${code}; return component`
)
const zh = JSON.parse(await readFile(new URL('../src/i18n/langs/zh.json', import.meta.url), 'utf8'))

async function register({ error, requestError, protocol = 'https:' } = {}) {
  const errors = [], successes = [], posts = [], options = []
  const component = load({}, {}, {}, passkey, (error) => error.response?.data.detail || error.message,
    { protocol, host: 'example.com' }, {
      credentials: {
        create: async (value) => {
          options.push(value)
          if (error) throw error
          return { id: 'new-credential', rawId: new Uint8Array([4, 5, 6]).buffer }
        }
      }
    })
  const vm = {
    ...component.methods,
    dialogVisible: true,
    reloads: 0,
    reloadTable() { this.reloads++ },
    $t: (key) => zh[key],
    $tc: (key) => zh[key],
    $message: { error: (msg) => errors.push(msg), success: (msg) => successes.push(msg) },
    $axios: {
      get: async () => {
        if (requestError) throw requestError
        return { publicKey: {
          challenge: 'AQID', user: { id: 'AQID' },
          excludeCredentials: [{ type: 'public-key', id: 'AQID', transports: ['internal'] }]
        } }
      },
      post: async (url, data) => { posts.push({ url, data }) }
    }
  }
  vm.onAddConfirm({ name: 'Laptop' })
  await setImmediate()
  return { vm, errors, successes, posts, options }
}

test('duplicate credentials show a localized recovery message and remain excluded', async () => {
  const result = await register({ error: new DOMException('The object is in an invalid state.', 'InvalidStateError') })
  assert.deepEqual(result.errors, [zh.PasskeyAlreadyRegistered])
  assert.match(result.errors[0], /请使用已有 Passkey/)
  assert.deepEqual(result.posts, [])
  assert.equal(result.vm.dialogVisible, true)
  const [excluded] = result.options[0].publicKey.excludeCredentials
  assert.deepEqual(new Uint8Array(excluded.id), new Uint8Array([1, 2, 3]))
  assert.equal(excluded.type, 'public-key')
  assert.deepEqual(excluded.transports, ['internal'])
})

test('user cancellation stays silent and does not submit a credential', async () => {
  const result = await register({ error: new DOMException('Cancelled', 'NotAllowedError') })
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.posts, [])
  assert.equal(result.vm.dialogVisible, true)
})

test('identity confirmation stays with the HTTP 412 handler', async () => {
  const result = await register({ requestError: { response: { status: 412 } } })
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.options, [])
  assert.deepEqual(result.posts, [])
})

test('server errors retain their existing response message', async () => {
  const result = await register({ requestError: { response: { status: 400, data: { detail: '注册失败，请重试' } } } })
  assert.deepEqual(result.errors, ['注册失败，请重试'])
  assert.deepEqual(result.posts, [])
})

test('HTTPS validation retains its translated message', async () => {
  const result = await register({ protocol: 'http:' })
  assert.deepEqual(result.errors, [zh.HTTPSRequiredForSupport])
  assert.deepEqual(result.options, [])
  assert.deepEqual(result.posts, [])
})

test('successful registration still submits, closes the dialog and refreshes the table', async () => {
  const result = await register()
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.posts, [{
    url: '/api/v1/authentication/passkeys/register/',
    data: { id: 'new-credential', rawId: 'BAUG', key_name: 'Laptop' }
  }])
  assert.equal(result.vm.dialogVisible, false)
  assert.equal(result.vm.reloads, 1)
  assert.deepEqual(result.successes, [zh.CreateSuccessMsg])
})
