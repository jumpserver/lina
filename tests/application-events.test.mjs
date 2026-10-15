import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { setImmediate } from 'node:timers/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL(
    '../src/views/accounts/Integration/components/ApplicationEventSendDialog.vue',
    import.meta.url
  ),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'Dialog',
  'ApplicationCommandResults',
  'getErrorResponseMsg',
  descriptor.script.content.replace(/^import .*\n/gm, '').replace('export default', 'return')
)(null, null, (error) => error.response?.data?.detail || error.message)

function options(id) {
  return {
    clients: [
      {
        id: `${id}-sdk`,
        instance_id: 'sdk',
        credential_ids: [`${id}-policy`],
        restart_supported: true
      },
      { id: `${id}-agent`, instance_id: 'agent', credential_ids: [], restart_supported: false }
    ],
    credentials: [{ id: `${id}-policy`, name: `${id} policy` }]
  }
}

function dialog({
  applications = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' }
  ],
  application = null,
  switchPermission = true
} = {}) {
  const requests = []
  const emitted = []
  const view = {
    ...component.data(),
    application,
    applications,
    $hasPerm(permission) {
      return switchPermission || permission !== 'accounts.change_applicationcredential'
    },
    $t(key) {
      return key
    },
    $emit(...args) {
      emitted.push(args)
    },
    $axios: {
      async get(url) {
        return options(url.split('/')[5])
      },
      async post(url, data) {
        requests.push({ url, data })
        return { command_id: `command-${url.split('/')[5]}`, recipients: [] }
      }
    }
  }
  for (const [name, getter] of Object.entries(component.computed)) {
    if (typeof getter === 'function') Object.defineProperty(view, name, { get: getter.bind(view) })
  }
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  return { view, requests, emitted }
}

test('batch requests keep each application policy and selected recipients together', async () => {
  const { view, requests, emitted } = dialog()
  await view.load()
  assert.equal(view.event, 'credential.switch.requested')
  assert.equal(view.canSend, true)
  await view.send()
  assert.deepEqual(
    requests.map(({ data }) => data),
    [
      {
        event: 'credential.switch.requested',
        client_ids: ['a-sdk'],
        credential_id: 'a-policy',
        timeout_minutes: 30
      },
      {
        event: 'credential.switch.requested',
        client_ids: ['b-sdk'],
        credential_id: 'b-policy',
        timeout_minutes: 30
      }
    ]
  )
  assert.equal(view.pendingEntries.length, 0)
  assert.equal(emitted.length, 2)
})

test('partial failures are visible and retry never resends accepted requests', async () => {
  const { view, requests } = dialog()
  await view.load()
  let reject = true
  view.$axios.post = async (url, data) => {
    requests.push({ url, data })
    if (url.includes('/b/') && reject)
      throw { response: { data: { detail: 'Application B is unavailable' } } }
    return { command_id: `command-${url.split('/')[5]}`, recipients: [] }
  }
  await view.send()
  assert.equal(view.entries[0].result.command_id, 'command-a')
  assert.equal(view.entries[1].error, 'Application B is unavailable')
  assert.equal(view.hasSendErrors, true)
  assert.equal(view.hasResults, true)
  reject = false
  await view.send()
  assert.deepEqual(
    requests.map(({ url }) => url.split('/')[5]),
    ['a', 'b', 'b']
  )
  assert.equal(view.pendingEntries.length, 0)
})

test('failed option loading blocks the batch until that application is reloaded', async () => {
  const { view, requests } = dialog()
  let fail = true
  view.$axios.get = async (url) => {
    if (url.includes('/b/') && fail) throw new Error('Load failed')
    return options(url.split('/')[5])
  }
  await view.load()
  assert.equal(view.canSend, false)
  await view.send()
  assert.equal(requests.length, 0)
  fail = false
  await view.loadEntry(view.entries[1], view.requestId)
  assert.equal(view.canSend, true)
  // Injecting a recipient from another application cannot enable a request.
  view.entries[1].clientIds = ['a-sdk']
  assert.equal(view.canSend, false)
})

test('detail sending stays available and policy permission does not grant restart targets', async () => {
  const { view, requests } = dialog({
    applications: [],
    application: { id: 'detail', name: 'Detail' },
    switchPermission: false
  })
  await view.load()
  assert.equal(view.entries.length, 1)
  assert.equal(view.event, 'application.restart.requested')
  assert.deepEqual(view.entries[0].clientIds, ['detail-sdk'])
  await view.send()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].data.credential_id, undefined)
  assert.equal(requests[0].url, '/api/v1/accounts/integration-applications/detail/send-event/')
})

test('old option responses cannot replace a newly opened dialog', async () => {
  const { view } = dialog({ applications: [{ id: 'old', name: 'Old' }] })
  const first = Promise.withResolvers()
  view.$axios.get = async (url) => (url.includes('/old/') ? first.promise : options('new'))
  const oldLoad = view.load()
  view.applications = [{ id: 'new', name: 'New' }]
  await view.load()
  first.resolve(options('old'))
  await oldLoad
  assert.equal(view.entries[0].application.id, 'new')
  assert.deepEqual(view.entries[0].clientIds, ['new-sdk'])
  assert.equal(view.loading, false)
})

test('double clicks and leaving the dialog do not dispatch additional applications', async () => {
  const { view, requests } = dialog()
  await view.load()
  const first = Promise.withResolvers()
  view.$axios.post = async (url, data) => {
    requests.push({ url, data })
    return first.promise
  }
  const sending = view.send()
  await view.send()
  assert.equal(requests.length, 1)
  component.beforeUnmount.call(view)
  first.resolve({ command_id: 'closed', recipients: [] })
  await sending
  await setImmediate()
  assert.equal(requests.length, 1)
  assert.equal(view.entries[0].result, null)
})

test('malformed event options report a load failure and leave the batch disabled', async () => {
  const { view } = dialog()
  view.$axios.get = async () => ({ clients: null, credentials: [] })
  await view.load()
  assert.equal(view.loading, false)
  assert.equal(view.canSend, false)
  assert.equal(
    view.entries.every((entry) => entry.loadFailed),
    true
  )
})
