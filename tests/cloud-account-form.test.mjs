import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { createRouter, createMemoryHistory } from 'vue-router'
import deepmerge from 'deepmerge'

async function load(path, dependencies) {
  const source = await readFile(new URL(`../src/${path}`, import.meta.url), 'utf8')
  const script = parse(source).descriptor.script.content
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*$/gm, '')
    .replace('export default', 'return')
  return new Function(...Object.keys(dependencies), script)(...Object.values(dependencies))
}
const form = await load('layout/components/GenericCreateUpdateForm/index.vue', {
  AutoDataForm: {}, deepmerge
})
const panel = await load('views/assets/Cloud/Account/components/AuthPanel.vue', {
  GenericCreateUpdateForm: {}, UploadKey: {}, RegionPanel: {},
  ACCOUNT_PROVIDER_ATTRS_MAP: { qcloud: { attrs: ['access_key_id', 'access_key_secret'] } },
  RequiredChange: {}, specialEmojiCheck: {}, encryptAttrsField: value => value
})

for (const category of ['database', 'host']) {
  for (const method of ['put', 'post']) {
    test(`${category} account ${method} preserves list context and completes its local flow`, async t => {
      t.mock.timers.enable({ apis: ['setTimeout'] })
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/console/assets/cloud', name: 'CloudAccountList', component: {} }]
      })
      await router.push({ name: 'CloudAccountList', query: { category, search: 'cloud-account', order: 'name' } })
      const before = router.currentRoute.value.fullPath
      const navigation = t.mock.method(router, 'push')
      const events = []
      const messages = []
      const saved = { id: 'account-id', name: 'cloud-account', category }
      const vm = {
        $t: key => key, $tc: key => key, $route: router.currentRoute.value,
        provider: 'qcloud', object: method === 'put' ? saved : {},
        submitType: method === 'put' ? 'update' : 'manual',
        $emit: (...args) => events.push(args)
      }
      const { settings } = panel.data.call(vm)
      const context = {
        ...form.methods, ...settings, method, drawer: false, $route: vm.$route, $router: router,
        getNextRoute: () => ({ name: 'CloudAccountList' }),
        onPerformSuccess: settings.onPerformSuccess || form.props.onPerformSuccess.default,
        $emit: (event, value) => {
          if (event === 'submitSuccess') panel.methods.handleSubmitSuccess.call(vm, value)
        },
        emitPerformSuccessMsg: (...args) => messages.push(args),
        performSubmit: async values => {
          assert.equal(values.category, category)
          return saved
        },
        onPerformError: error => { throw error }
      }
      await form.methods.defaultOnSubmit.call(context, settings.cleanFormValue.call(context, {
        name: saved.name, attrs: {}
      }), 'form', false)
      t.mock.timers.tick(500)
      await Promise.resolve()
      await Promise.resolve()
      assert.equal(navigation.mock.callCount(), 0)
      assert.equal(router.currentRoute.value.fullPath, before)
      assert.deepEqual(messages, [[method, saved, false]])
      assert.deepEqual(events, method === 'put'
        ? [['submitSuccess'], ['update:visible', false]]
        : [['update:object', saved], ['update:active', 2]])
    })
  }
}
