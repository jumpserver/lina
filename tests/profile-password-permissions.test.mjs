import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import _ from 'lodash'

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
const withoutImports = (source) => source.replace(/^import .*$/gm, '')
const i18n = { t: (value) => value, global: { t: (value) => value } }
const { checkPermission, getResourceNameByPath } = new Function(
  withoutImports(await read('utils/jms/permission.js')).replace(/export function /g, 'function ') +
    '\nreturn { checkPermission, getResourceNameByPath }'
)()
const routeSource = withoutImports(await read('router/profile/index.js'))
const permissionSource = withoutImports(await read('store/modules/permission.js'))
  .replace(/export function /g, 'function ')
  .replace('export default', 'const permissionModule =')

const { descriptor } = parse(await read('views/profile/PasswordAndSSHKey/index.vue'))
const component = new Function(
  'GenericDetailPage',
  'Password',
  'SSHKeyList',
  'UKey',
  withoutImports(descriptor.script.content).replace('export default', 'return')
)({}, {}, {}, {})
const template = compileTemplate({
  source: descriptor.template.content,
  filename: 'PasswordAndSSHKey.vue',
  id: 'profile-password',
  compilerOptions: { mode: 'function' }
})
assert.deepEqual(template.errors, [])
const render = new Function('Vue', template.code)({
  ...Vue,
  resolveComponent: (name) => ({ name }),
  resolveDynamicComponent: (name) => name
})

function createView({ source = 'local', ssh = false, publicKey = true, ukey = true } = {}) {
  const view = {
    $store: {
      state: {
        users: {
          profile: {
            source: { value: source },
            can_public_key_auth: publicKey,
            can_ukey_auth: ukey
          }
        }
      }
    },
    $t: (value) => value,
    $hasPerm: (permission) => ssh && permission === 'authentication.view_sshkey'
  }
  for (const [name, method] of Object.entries(component.methods)) view[name] = method.bind(view)
  Object.assign(view, component.data.call(view))
  component.watch.passwordMenuDisabled.handler.call(
    view,
    component.computed.passwordMenuDisabled.call(view)
  )
  return view
}

function renderedTab(view) {
  return render(view, []).children.default()[0].children[0].type
}

test('the password route does not require SSH permissions; SSH create/update routes still do', () => {
  for (const grants of [[], ['authentication.add_sshkey', 'authentication.change_sshkey']]) {
    const route = new Function(
      'Layout',
      'i18n',
      'empty',
      routeSource.replace('export default', 'return')
    )({}, i18n, { routeViewShell: true })
    const filter = new Function(
      'getResourceNameByPath',
      'hasPermission',
      'i18n',
      '_',
      permissionSource + '\nreturn filterPermedRoutes'
    )(getResourceNameByPath, (required) => checkPermission(required, grants), i18n, _)
    const page = filter([route], null)[0].children.find(
      (child) => child.path === '/profile/password-and-ssh-key'
    )
    const names = page.children.map((child) => child.name)
    assert.ok(names.includes('SSHKeyList'))
    assert.equal(names.includes('SSHKeyCreate'), grants.includes('authentication.add_sshkey'))
    assert.equal(names.includes('SSHKeyUpdate'), grants.includes('authentication.change_sshkey'))
  }
})

test('local users without SSH permission can change passwords and cannot open the SSH tab', () => {
  const view = createView()
  assert.equal(view.config.submenu.find((tab) => tab.name === 'Password').disabled, false)
  assert.equal(view.config.submenu.find((tab) => tab.name === 'SSHKeyList').disabled, true)
  assert.equal(renderedTab(view), 'Password')
  view.handleUpdate('SSHKeyList')
  assert.equal(renderedTab(view), Vue.Comment)
})

test('SSH tab availability requires both the feature setting and view permission', () => {
  for (const ssh of [false, true]) {
    for (const publicKey of [false, true]) {
      const view = createView({ ssh, publicKey })
      assert.equal(
        view.config.submenu.find((tab) => tab.name === 'SSHKeyList').disabled,
        !(ssh && publicKey)
      )
    }
  }
  const view = createView({ ssh: true })
  view.handleUpdate('SSHKeyList')
  assert.equal(renderedTab(view), 'SSHKeyList')
})

test('non-local users only default to SSH when the feature and permission allow it', () => {
  for (const options of [{ ssh: false }, { ssh: true }, { ssh: true, publicKey: false }]) {
    const view = createView({ source: 'ldap', ...options })
    assert.equal(view.config.submenu.find((tab) => tab.name === 'Password').disabled, true)
    assert.equal(
      view.config.activeMenu,
      options.ssh && options.publicKey !== false ? 'SSHKeyList' : 'Password'
    )
  }
})

test('UKey remains registered, selectable without SSH permission, and controlled by its own setting', () => {
  assert.ok(component.components.UKey)
  for (const ukey of [false, true]) {
    const view = createView({ source: 'ldap', ukey })
    assert.equal(view.config.submenu.find((tab) => tab.name === 'UKey').hidden, !ukey)
    if (ukey) {
      view.handleUpdate('UKey')
      assert.equal(renderedTab(view), 'UKey')
    }
  }
})

test('cached password, SSH and UKey tabs have distinct component identities', () => {
  const view = createView({ ssh: true })
  const identities = ['Password', 'SSHKeyList', 'UKey'].map((tab) => {
    view.handleUpdate(tab)
    const vnode = render(view, []).children.default()[0].children[0]
    return vnode.key ?? vnode.type
  })
  assert.equal(new Set(identities).size, 3)
})
