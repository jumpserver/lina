import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse, compileTemplate } from '@vue/compiler-sfc'

const source = await readFile(
  new URL('../src/views/perms/AssetPermission/components/AccountFormatter.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename: 'AccountFormatter.vue',
    id: 'accounts'
  }).errors,
  []
)
const bindings = {
  TagInput: {},
  ListTable: {},
  Dialog: {},
  accountTemplateTable: {},
  AllAccount: '@ALL',
  SpecAccount: '@SPEC',
  ExcludeAccount: '@NOT',
  NoneAccount: '@NONE',
  ManualAccount: '@INPUT',
  SameAccount: '@USER',
  AnonymousAccount: '@ANON',
  realChoices: [],
  virtualAccount: {},
  virtualAccounts: [{ value: '@USER' }]
}
const component = new Function(
  ...Object.keys(bindings),
  descriptor.script.content
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]/gm, '')
    .replace('export default', 'return')
)(...Object.values(bindings))

function formatter(value) {
  const emitted = []
  const view = {
    ...component.data.call({}),
    currentValue: value,
    $log: { debug() {} },
    $emit(name, value) {
      if (name === 'change') emitted.push(value)
    },
    $nextTick(callback) {
      callback()
    }
  }
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  view.initDefaultChoice()
  view.showSpecZone = view.realRadioSelected === view.SPEC
  return { view, emitted }
}

test('excluding usernames preserves all other accounts and virtual grants', () => {
  const { view, emitted } = formatter(['@ALL', '@USER'])
  view.realRadioSelected = view.EXCLUDE
  view.handleExcludeAccountsChange(['root', 'admin'])
  assert.deepEqual(emitted.at(-1), ['@ALL', '!root', '!admin', '@USER'])
})

test('saved exclusions reopen in exclude mode and survive saving', () => {
  const { view, emitted } = formatter(['@ALL', '!root'])
  assert.equal(view.realRadioSelected, view.EXCLUDE)
  assert.deepEqual(view.excludeAccountsInput, ['root'])
  view.outputValue()
  assert.deepEqual(emitted.at(-1), ['@ALL', '!root'])
})

test('resaving legacy exclusion-only values restores the all-accounts grant', () => {
  const { view, emitted } = formatter(['!root'])
  assert.equal(view.realRadioSelected, view.EXCLUDE)
  view.outputValue()
  assert.deepEqual(emitted.at(-1), ['@ALL', '!root'])
})

test('all, specific and no-account selections keep their existing meaning', () => {
  for (const value of [['@ALL'], ['@SPEC', 'www'], []]) {
    const { view, emitted } = formatter(value)
    view.outputValue()
    assert.deepEqual(emitted.at(-1), value)
  }
})

test('an empty exclusion selection does not grant all accounts', () => {
  const { view, emitted } = formatter([])
  view.realRadioSelected = view.EXCLUDE
  view.handleExcludeAccountsChange([])
  assert.deepEqual(emitted.at(-1), [])
})
