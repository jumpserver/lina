import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { mapGetters } from 'vuex'

const source = await readFile(
  new URL('../src/layout/components/Page/LicenseRelatedTip.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'mapGetters',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)(mapGetters)

function message(licenseData, { enabled = true, permitted = true } = {}) {
  const vm = {
    licenseData,
    $store: { getters: { publicSettings: { XPACK_ENABLED: enabled } } },
    $hasPerm: () => permitted,
    $t: (key) => key
  }
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(vm, name, { get: () => getter.call(vm) })
  }
  return vm.licenseMsg
}

const missingLicense = {
  subscription_id: '',
  corporation: '',
  date_expired: '',
  serial_no: '',
  remark: '',
  asset_count: 0,
  current_asset_count: 3,
  edition: '',
  message: ''
}
const installedLicense = {
  ...missingLicense,
  subscription_id: 'installed-license',
  date_expired: '2099-01-01',
  asset_count: 10
}

test('missing licenses request an import with or without existing assets', () => {
  assert.equal(message(missingLicense), 'LicenseNotImported')
  assert.equal(message({ ...missingLicense, current_asset_count: 0 }), 'LicenseNotImported')
})

test('installed licenses retain valid, exceeded, expired and test-license behavior', () => {
  assert.equal(message(installedLicense), false)
  assert.equal(
    message({ ...installedLicense, current_asset_count: 11 }),
    'LicenseReachedAssetAmountLimit'
  )
  assert.equal(message({ ...installedLicense, date_expired: '2000-01-01' }), 'LicenseExpired')
  assert.equal(message({ ...installedLicense, corporation: 'FIT2CLOUD' }), 'LicenseForTest')
})

test('JDMC warning messages retain priority', () => {
  for (const [code, key] of [
    ['license_expired', 'LicenseExpired'],
    ['license_maintenance_expired', 'LicenseMaintenanceExpired'],
    ['license_will_expire', 'LicenseWillExpire']
  ]) {
    assert.equal(message({ ...installedLicense, message: code, current_asset_count: 11 }), key)
  }
})

test('community users, unauthorized users and unloaded data do not show import warnings', () => {
  assert.equal(message(missingLicense, { enabled: false }), false)
  assert.equal(message(missingLicense, { permitted: false }), false)
  assert.equal(message({}), false)
})
