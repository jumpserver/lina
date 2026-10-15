import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { setImmediate } from 'node:timers/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/accounts/Integration/SDKList.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'IBox',
  'MarkdownRenderer',
  descriptor.script.content.replace(/^import .*\n/gm, '').replace('export default', 'return')
)(null, null)

function documentationView() {
  const requests = []
  const route = { query: {} }
  const view = {
    ...component.data.call({ $route: route }),
    $route: route,
    $router: {
      replace: ({ query }) => {
        route.query = query
      }
    },
    $refs: {},
    $axios: {
      get(url, options) {
        const pending = Promise.withResolvers()
        requests.push({ url, language: options.params.language, ...pending })
        return pending.promise
      }
    }
  }
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(view, name, { get: getter.bind(view) })
  }
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  return { view, requests }
}

function document(language) {
  return {
    readme: `${language}\n<!-- agent-doc:start -->agent<!-- agent-doc:end -->\n<!-- sdk-doc:start -->sdk<!-- sdk-doc:end -->`,
    runtime: language,
    credential_policies: true
  }
}

test('a stale SDK response cannot replace the current Agent document', async () => {
  const { view, requests } = documentationView()
  view.selectDocumentation('sdk')
  view.selectSDKLanguage('go')
  view.selectDocumentation('agent')
  assert.deepEqual(
    requests.map((request) => request.language),
    ['go', 'python']
  )
  requests[1].resolve(document('python'))
  await setImmediate()
  assert.equal(view.activeDocument, 'agent')
  requests[0].resolve(document('go'))
  await setImmediate()
  assert.equal(view.credentialPolicies, true)
  assert.equal(view.sdkRuntime, 'python')
  assert.equal(view.activeDocument, 'agent')
  assert.equal(view.documentationLoading, false)
  assert.equal(view.sdkLanguage, 'go')
  view.selectDocumentation('sdk')
  assert.equal(requests[2].language, 'go')
  requests[2].resolve(document('go'))
  await setImmediate()
  assert.equal(view.documentationDescription, 'SDKDescription')
})

test('switching UI locale reloads documentation and ignores a previous failure', async () => {
  const { view, requests } = documentationView()
  const oldRequest = view.loadDocumentation()
  component.watch['$i18n.locale'].call(view)
  requests[1].resolve(document('python'))
  await setImmediate()
  requests[0].reject(new Error('previous locale request failed'))
  await oldRequest
  assert.equal(view.documentationError, false)
  assert.equal(view.activeDocument, 'agent')
  assert.equal(view.documentationLoading, false)
})

test('switching Python tabs reuses the guide and unmount ignores pending results', async () => {
  const { view, requests } = documentationView()
  const initialRequest = view.loadDocumentation()
  requests[0].resolve(document('python'))
  await initialRequest
  view.selectDocumentation('sdk')
  assert.equal(view.activeDocument, 'sdk')
  assert.equal(requests.length, 1)
  const pendingRequest = view.loadDocumentation()
  component.beforeUnmount.call(view)
  requests[1].resolve({ readme: 'stale' })
  await pendingRequest
  assert.equal(view.activeDocument, 'sdk')
})
