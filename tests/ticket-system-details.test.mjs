import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'
import { h } from 'vue'

async function component(path, dependencies) {
  const source = await readFile(new URL(`../src/views/tickets/${path}`, import.meta.url), 'utf8')
  const script = parse(source)
    .descriptor.script.content.replace(/^import .*$/gm, '')
    .replace('export default', 'const component =')
  const { code } = transformSync(script, { loader: 'jsx', jsxFactory: 'h' })
  return new Function('h', ...Object.keys(dependencies), `${code}; return component`)(
    h,
    ...Object.values(dependencies)
  )
}

const command = await component('CommandConfirm/Detail/TicketDetail.vue', {
  Drawer: {},
  GenericTicketDetail: {}
})
test('missing sessions render a dash; valid sessions retain their permission-gated link', () => {
  const opened = []
  const vm = {
    object: { request_items: [{ name: 'apply_from_session', label: 'Session' }] },
    $t: (key) => key,
    $hasPerm: () => true,
    handleSideEffect: (value) => opened.push(value)
  }
  const [{ formatter }] = command.computed.specialCardItems.call(vm)
  for (const value of [null, undefined, '']) assert.equal(formatter({}, value), '-')
  const link = formatter({}, 'session-id')
  assert.equal(link.type, 'el-link')
  link.props.onClick()
  assert.deepEqual(opened, ['session-id'])
  vm.$hasPerm = () => false
  const label = formatter({}, 'session-id')
  assert.equal(label.type, 'span')
  assert.equal(label.props?.onClick, undefined)
})

const toSafeLocalDateStr = (value) => (value ? `local:${value}` : '-')
const login = await component('LoginConfirm/Detail/TicketDetail.vue', {
  GenericTicketDetail: {},
  toSafeLocalDateStr
})
const assigned = await component('AssignedTicketList.vue', {
  AutoDetailCard: {},
  Dialog: {},
  BaseTicketList: {},
  LoginAssetConnections: {},
  mapGetters: () => ({}),
  toSafeLocalDateStr
})
test('login details and batch approval format login dates and preserve the other request fields', () => {
  for (const value of ['2026-03-11T01:58:20.613216+00:00', null, '']) {
    const ticket = {
      request_items: [
        { name: 'apply_login_ip', label: 'IP', value: '10.0.0.5' },
        { name: 'apply_login_datetime', label: 'Date', value }
      ]
    }
    const detail = login.computed.specialCardItems.call({ object: ticket })
    const batch = assigned.methods.getDetailFields.call({ $t: (key) => key }, ticket).slice(1)
    for (const items of [detail, batch]) {
      assert.equal(items[0].value, '10.0.0.5')
      assert.equal(items[1].value, toSafeLocalDateStr(value))
    }
  }
})

const asset = await component('RequestAssetPerm/Detail/TicketDetail.vue', {
  GenericTicketDetail: {},
  toSafeLocalDateStr
})
test('asset detail and batch approval format both validity dates without changing request data', () => {
  for (const value of [
    '2026-10-15T07:31:55.893000+00:00',
    '2026-10-15T15:31:55.893+08:00',
    null,
    undefined,
    ''
  ]) {
    const ticket = {
      request_items: [
        { name: 'apply_assets', label: 'Assets', value: 'server-1' },
        { name: 'apply_date_start', label: 'Start', value },
        { name: 'apply_date_expired', label: 'Expiry', value },
        { name: 'description', label: 'Description', value: '2026-10-15T07:31:55Z' }
      ]
    }
    const original = structuredClone(ticket)
    const detail = asset.computed.specialCardItems
      .call({
        object: ticket,
        $t: (key) => key,
        getSystemExpireNoticeDescription: () => 'System reminder',
        getExpireNoticeDescription: () => 'Disabled'
      })
      .slice(0, 4)
    const batch = assigned.methods.getDetailFields.call({ $t: (key) => key }, ticket).slice(1)
    for (const fields of [detail, batch]) {
      assert.deepEqual(
        fields.map((field) => field.value),
        ['server-1', toSafeLocalDateStr(value), toSafeLocalDateStr(value), '2026-10-15T07:31:55Z']
      )
    }
    assert.deepEqual(ticket, original)
  }
})
