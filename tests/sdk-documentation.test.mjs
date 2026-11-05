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

function documentationView(query = {}) {
  const requests = []
  const route = { name: 'IntegrationApplicationList', query }
  const view = {
    ...component.data.call({ $route: route }),
    $route: route,
    $router: {
      replace: ({ query }) => {
        route.query = query
      }
    },
    $refs: {},
    $nextTick: (callback) => callback(),
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
    readme: `${language}\n<!-- overview-doc:start -->overview<!-- overview-doc:end -->\n<!-- protocol-doc:start -->protocol<!-- protocol-doc:end -->\n<!-- socket-doc:start -->socket<!-- socket-doc:end -->\n<!-- agent-doc:start -->agent<!-- agent-doc:end -->\n<!-- sdk-doc:start -->sdk<!-- sdk-doc:end -->`,
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
  assert.equal(view.activeDocument, 'overview')
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

test('reactivating a cached document follows the route instead of restoring its previous tab', async () => {
  const { view, requests } = documentationView()
  const initialRequest = view.loadDocumentation()
  requests[0].resolve(document('python'))
  await initialRequest
  view.selectDocumentation('sdk')
  // Returning to the route without sdk_language reuses the cached base page.
  view.$route.query = {}
  component.activated.call(view)
  assert.equal(view.documentationTab, 'overview')
  assert.equal(view.activeDocument, 'overview')
  assert.equal(requests.length, 1)

  view.$route.query = { sdk_language: 'java' }
  component.activated.call(view)
  assert.equal(view.documentationTab, 'sdk')
  assert.equal(view.sdkLanguage, 'java')
  assert.equal(requests[1].language, 'java')
  requests[1].resolve(document('java'))
  await setImmediate()
  assert.equal(view.activeDocument, 'sdk')
  component.deactivated.call(view)
  assert.equal(view.headingObserver, null)
})

test('overview is the default and explicit guide links select the intended document', () => {
  assert.equal(documentationView().view.documentationTab, 'overview')
  for (const tab of ['overview', 'agent', 'socket', 'sdk', 'protocol']) {
    const { view } = documentationView({ documentation: tab })
    view.readme = document('python').readme
    assert.equal(view.documentationTab, tab)
    assert.equal(view.activeDocument, tab)
    assert.equal(view.activeLanguage, 'python')
  }
  const { view } = documentationView({ sdk_language: 'go' })
  assert.equal(view.documentationTab, 'sdk')
  assert.equal(view.activeLanguage, 'go')
})

test('guide selection is shareable and common guides clear the SDK language', () => {
  const { view } = documentationView()
  view.readme = document('python').readme
  view.selectDocumentation('sdk')
  assert.deepEqual(view.$route.query, { documentation: 'sdk', sdk_language: 'python' })
  view.selectDocumentation('protocol')
  assert.deepEqual(view.$route.query, { documentation: 'protocol' })
  assert.equal(view.activeDocument, 'protocol')
  view.selectDocumentation('agent')
  assert.deepEqual(view.$route.query, { documentation: 'agent' })
  assert.equal(view.activeDocument, 'agent')
})

test('leaving a different SDK for shared reference ignores its late response', async () => {
  const { view, requests } = documentationView({ documentation: 'sdk', sdk_language: 'go' })
  const oldRequest = view.loadDocumentation()
  view.selectDocumentation('protocol')
  assert.deepEqual(
    requests.map(({ language }) => language),
    ['go', 'python']
  )
  requests[1].resolve(document('python'))
  await setImmediate()
  requests[0].resolve(document('go'))
  await oldRequest
  assert.equal(view.documentationTab, 'protocol')
  assert.equal(view.activeDocument, 'protocol')
  assert.equal(view.sdkRuntime, 'python')
  view.selectDocumentation('overview')
  assert.equal(requests.length, 2)
  assert.equal(view.activeDocument, 'overview')
})


test('Socket access has an independent shareable guide and reuses the common locale document', async () => {
  const { view, requests } = documentationView({ documentation: 'socket' })
  const initial = view.loadDocumentation()
  requests[0].resolve(document('python'))
  await initial
  assert.equal(view.activeDocument, 'socket')
  assert.equal(view.documentationTitle, 'SocketAPIAccess')
  assert.equal(view.documentationDescription, 'SocketAPIDescription')
  view.selectDocumentation('sdk')
  view.selectDocumentation('socket')
  assert.deepEqual(view.$route.query, { documentation: 'socket' })
  assert.equal(requests.length, 1)
  view.readme = '<!-- agent-doc:start -->agent<!-- agent-doc:end -->'
  assert.equal(view.activeDocument, '')
})
