import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import lodash from 'lodash'

const source = await readFile(
  new URL('../src/components/Cards/DetailCard/EditableItem.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const component = new Function(
  'cloneDeep',
  'getErrorResponseMsg',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)(lodash.cloneDeep, (error) => error.response?.data?.detail || error.message)

function createEditor(overrides = {}) {
  const requests = []
  const events = []
  const vm = {
    ...component.data(),
    item: { field: 'name', key: 'Name', value: 'original', editor: true },
    object: { name: 'original', comment: 'untouched' },
    url: '/api/v1/assets/assets/example/',
    $hasPerm: () => true,
    $nextTick: () => {},
    $t: (key) => key,
    $emit: (event, payload) => events.push({ event, payload }),
    $message: { success() {} },
    $axios: {
      patch: async (url, data, config) => {
        requests.push({ url, data, config })
        return { name: 'normalized', comment: 'server value' }
      }
    },
    ...overrides
  }
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(vm, name, { get: () => getter.call(vm) })
  }
  return { vm, requests, events }
}

test('object and array drafts are isolated and cancel never writes', () => {
  for (const value of [{ nested: { name: 'original' } }, [{ name: 'original' }]]) {
    const original = structuredClone(value)
    const { vm, requests, events } = createEditor({ object: { name: value } })
    vm.startEditing()
    if (Array.isArray(vm.draft)) vm.draft[0].name = 'draft'
    else vm.draft.nested.name = 'draft'
    assert.deepEqual(value, original)
    vm.cancel()
    assert.equal(vm.editing, false)
    assert.deepEqual(vm.object.name, original)
    assert.deepEqual(requests, [])
    assert.deepEqual(events, [])
  }
})

test('default PATCH submits only the API field and reports the normalized server value', async () => {
  const { vm, requests, events } = createEditor()
  vm.startEditing()
  vm.updateDraft('draft')
  await vm.save()
  assert.deepEqual(requests, [
    { url: vm.url, data: { name: 'draft' }, config: { disableFlashErrorMsg: true } }
  ])
  assert.equal(vm.displayValue, 'normalized')
  assert.equal(vm.editing, false)
  assert.equal(events[0].event, 'updated')
  assert.equal(events[0].payload.value, 'normalized')
  assert.deepEqual(vm.object, { name: 'original', comment: 'untouched' })
})

test('empty responses retain the submitted value and field-specific URLs are supported', async () => {
  const { vm, requests, events } = createEditor()
  vm.item.editor = { url: '/api/v1/custom/name/' }
  vm.$axios.patch = async (url, data) => {
    requests.push({ url, data })
    return ''
  }
  vm.startEditing()
  vm.updateDraft('new name')
  await vm.save()
  assert.deepEqual(requests[0], { url: '/api/v1/custom/name/', data: { name: 'new name' } })
  assert.equal(vm.displayValue, 'new name')
  assert.equal(events[0].payload.value, 'new name')
})

test('legacy component events update drafts without changing resource data', () => {
  const { vm } = createEditor({
    item: {
      field: 'phone',
      key: 'Phone',
      value: { code: '+86', phone: '123' },
      editor: { component: 'PhoneInput', valueProp: 'value', changeEvent: 'change' }
    },
    object: {}
  })
  vm.startEditing()
  assert.deepEqual(vm.inputProps.value, { code: '+86', phone: '123' })
  vm.inputEvents.change('+86123456')
  assert.equal(vm.draft, '+86123456')
  assert.deepEqual(vm.item.value, { code: '+86', phone: '123' })
})

test('read-only, disabled, missing target, and revoked permissions cannot submit', async () => {
  for (const editor of [false, { disabled: true }, { permission: 'assets.change_asset' }]) {
    const { vm, requests } = createEditor({ $hasPerm: () => false })
    vm.item.editor = editor
    vm.startEditing()
    await vm.save()
    assert.equal(vm.editing, false)
    assert.deepEqual(requests, [])
  }
  const { vm, requests } = createEditor({ url: '' })
  vm.startEditing()
  assert.equal(vm.editing, false)
  vm.url = '/api/v1/example/'
  vm.item.editor = { permission: 'assets.change_asset' }
  vm.startEditing()
  vm.$hasPerm = () => false
  await vm.save()
  assert.deepEqual(requests, [])
})

test('validation and request failures keep the editor and draft available for retry', async () => {
  const { vm, requests, events } = createEditor()
  vm.item.editor = { validate: async () => 'invalid name' }
  vm.startEditing()
  vm.updateDraft('draft')
  await vm.save()
  assert.equal(vm.error, 'invalid name')
  assert.equal(vm.draft, 'draft')
  assert.equal(vm.editing, true)
  assert.equal(vm.saving, false)
  assert.deepEqual(requests, [])
  vm.item.editor = true
  vm.$axios.patch = async () => {
    throw { response: { data: { detail: 'rejected' } } }
  }
  await vm.save()
  assert.equal(vm.error, 'rejected')
  assert.equal(vm.draft, 'draft')
  assert.equal(vm.editing, true)
  assert.deepEqual(events, [])
})

test('custom saves receive raw values and context, while pending saves block repeat or cancel', async () => {
  let resolve
  let calls = 0
  const { vm, requests, events } = createEditor()
  vm.item.editor = {
    save: (value, context) => {
      calls++
      assert.equal(value, 'draft')
      assert.equal(context.field, 'name')
      assert.equal(context.object, vm.object)
      return new Promise((done) => {
        resolve = done
      })
    }
  }
  vm.startEditing()
  vm.updateDraft('draft')
  const pending = vm.save()
  await vm.save()
  vm.cancel()
  vm.updateDraft('late input')
  assert.equal(vm.editing, true)
  assert.equal(vm.draft, 'draft')
  assert.equal(vm.inputProps.disabled, true)
  assert.equal(calls, 1)
  resolve({ name: 'saved' })
  await pending
  assert.equal(vm.displayValue, 'saved')
  assert.equal(vm.saving, false)
  assert.deepEqual(requests, [])
  assert.equal(events.length, 1)
})

test('revoking permission during async validation prevents the request', async () => {
  let resolve
  const { vm, requests } = createEditor()
  vm.item.editor = {
    permission: 'assets.change_asset',
    validate: () =>
      new Promise((done) => {
        resolve = done
      })
  }
  vm.startEditing()
  const pending = vm.save()
  vm.$hasPerm = () => false
  resolve('')
  await pending
  assert.deepEqual(requests, [])
  assert.equal(vm.editing, true)
  assert.equal(vm.saving, false)
})

test('Enter preserves IME, multiline and widget keyboard behavior, and saves text input', () => {
  const { vm } = createEditor()
  let saved = 0
  vm.save = () => {
    saved++
  }
  const target = { tagName: 'INPUT', closest: () => null }
  for (const event of [
    { isComposing: true, target },
    { defaultPrevented: true, target },
    { target: { tagName: 'TEXTAREA' } },
    { target: { tagName: 'BUTTON' } },
    { target: { tagName: 'INPUT', closest: () => ({}) } }
  ])
    vm.onEnter({ preventDefault() {}, ...event })
  assert.equal(saved, 0)
  let prevented = false
  vm.onEnter({
    target,
    preventDefault: () => {
      prevented = true
    }
  })
  assert.equal(prevented, true)
  assert.equal(saved, 1)
})
