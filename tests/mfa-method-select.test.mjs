import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const source = await readFile(new URL('../src/components/Form/FormFields/MFAMethodSelect.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const component = new Function(
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)()

function field(value, system = false) {
  const events = []
  const context = {
    value, system, ready: true, formRenderer: null,
    methods: [
      { value: 'otp', label: 'OTP', visible: true, enabled: true, allowed: true },
      { value: 'sms', label: 'SMS', visible: true, enabled: true, allowed: false },
      { value: 'face', label: 'Face', visible: false, enabled: false, allowed: true },
      { value: 'passkey', label: 'Passkey', visible: true, enabled: false, allowed: true }
    ],
    $emit: (event, value) => events.push({ event, value })
  }
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(context, name, { get: () => getter.call(context) })
  }
  return { context, events }
}

test('inheritance stays empty and tracks capability changes', () => {
  const { context } = field([])
  assert.equal(context.mode, 'inherit')
  assert.deepEqual(context.effective.map((item) => item.value), ['otp'])
  context.methods[3].enabled = true
  assert.deepEqual(context.effective.map((item) => item.value), ['otp', 'passkey'])
  assert.deepEqual(context.value, [])
})

test('custom policy respects system policy and preserves inactive selections', () => {
  const { context, events } = field(['otp', 'sms', 'face'])
  assert.deepEqual(context.effective.map((item) => item.value), ['otp'])
  assert.equal(context.hasUnavailableSelection, true)
  assert.equal(context.visibleMethods.some((item) => item.value === 'face'), false)
  component.methods.changeSelection.call(context, ['otp', 'face'])
  assert.deepEqual(events[0].value, ['otp', 'face'])
  component.methods.changeMode.call(context, 'inherit')
  assert.deepEqual(events[1].value, [])
})

test('custom mode starts with only currently permitted available methods', () => {
  const { context, events } = field([])
  component.methods.changeMode.call(context, 'custom')
  assert.deepEqual(events[0].value, ['otp'])
})

test('system policy retains disabled methods and previews unsaved email switch', () => {
  const { context } = field(['otp', 'face', 'passkey', 'email'], true)
  context.methods.push({ value: 'email', label: 'Email', visible: true, enabled: false, allowed: true })
  context.formRenderer = { getElForm: () => ({ model: { SECURITY_MFA_BY_EMAIL: true } }) }
  assert.deepEqual(context.effective.map((item) => item.value), ['otp', 'email'])
  assert.deepEqual(context.selected, ['otp', 'face', 'passkey', 'email'])
})
