import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/components/Apps/BlockedIPs/index.vue', import.meta.url),
  'utf8'
)
const script = parse(source)
  .descriptor.script.content.replace(/^import .*$/gm, '')
  .replace('export default', 'return')
const component = compileFunction(script, ['Dialog', 'BlockedIPList'])({}, {})

function setup(axios) {
  return {
    ...component.data.call({}),
    ...component.methods,
    $axios: axios,
    $message: { success() {} },
    $tc: (key) => key
  }
}

test('unlock reloads the server list and an older in-flight refresh cannot restore the IP', async () => {
  const stale = Promise.withResolvers()
  const row = { ip: '192.0.2.1' }
  const remaining = { ip: '192.0.2.2' }
  const calls = []
  const vm = setup({
    get: async (url) => {
      calls.push(url)
      return calls.length === 1 ? stale.promise : { results: [remaining] }
    },
    post: async (url, data) => calls.push([url, data])
  })
  vm.lockedIPs = [row]
  const firstLoad = vm.getLockedIp()
  await vm.unlockIPs([row.ip])
  stale.resolve({ results: [row] })
  await firstLoad
  assert.deepEqual(calls, [
    '/api/v1/settings/security/block-ip/',
    ['/api/v1/settings/security/unlock-ip/', { ips: [row.ip] }],
    '/api/v1/settings/security/block-ip/'
  ])
  assert.deepEqual(vm.lockedIPs, [remaining])
})

test('failed unlock keeps the current list and does not report success', async () => {
  const row = { ip: '192.0.2.1' }
  const vm = setup({
    post: async () => {
      throw new Error('denied')
    }
  })
  vm.lockedIPs = [row]
  vm.$message.success = assert.fail
  await assert.rejects(vm.unlockIPs([row.ip]), /denied/)
  assert.deepEqual(vm.lockedIPs, [row])
})
