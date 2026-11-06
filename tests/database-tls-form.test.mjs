import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(new URL('../src/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue', import.meta.url), 'utf8')
const script = parse(source).descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
const component = new Function('BaseAssetCreateUpdate', 'UploadKey', 'rules', script)({}, {}, { Required: {} })
const context = (type) => ({ $t: (key) => key, $context: { get: () => type } })

test('database TLS forms retain certificate pairs and distinct backend settings', () => {
  for (const type of ['mysql', 'mariadb', 'postgresql']) {
    const vm = context(type)
    const fields = component.methods.getAddFields.call(vm).flat(3)
    for (const field of ['use_ssl', 'ca_cert', 'client_cert', 'client_key']) assert.ok(fields.includes(field))
    const meta = component.methods.getAddFieldsMeta.call(vm)
    assert.equal(meta.use_ssl.helpText, 'DatabaseSSLBackendHelp')
    assert.equal(meta.ca_cert.hidden({ use_ssl: false }), true)
    assert.equal(meta.client_key.hidden({ use_ssl: true }), false)
    const updates = []
    meta.use_ssl.on.change([true], (value) => updates.push(value))
    if (type === 'postgresql') {
      assert.deepEqual(updates, [{ pg_ssl_mode: 'verify-full' }])
      assert.equal(meta.pg_ssl_mode.hidden({ use_ssl: false }), true)
    } else assert.deepEqual(updates, [])
  }
})
