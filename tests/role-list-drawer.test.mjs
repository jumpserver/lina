import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile, createRenderer, nextTick, reactive } from 'vue'

const source = await readFile(
  new URL('../src/views/users/Role/RoleList/BaseRoleList.vue', import.meta.url),
  'utf8'
)
const { descriptor } = parse(source)
const table = {
  data: () => ({ drawerContext: null, closeCount: 0 }),
  methods: {
    afterCloseDrawer() {
      this.drawerContext = null
      this.closeCount++
    }
  },
  render: () => null
}
const roleList = new Function(
  'DrawerListTable',
  'DetailFormatter',
  descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return')
)(table, {})
roleList.render = compile(descriptor.template.content)

test('ending a role action releases only its drawer and preserves both role lists', async (t) => {
  const store = { getters: reactive({ inDrawer: false }) }
  const renderer = createRenderer({ createComment: () => ({}), insert() {}, remove() {} })
  function mount(scope) {
    const app = renderer.createApp(roleList, { scope })
    Object.assign(app.config.globalProperties, { $store: store, $hasPerm: () => true })
    t.after(() => app.unmount())
    return app.mount({})
  }
  const system = mount('system')
  const org = mount('org')
  for (const [active, idle] of [
    [system, org],
    [org, system]
  ]) {
    const table = active.$refs.ListTable
    const idleCount = idle.$refs.ListTable.closeCount
    table.drawerContext = { action: 'create', id: '' }
    store.getters.inDrawer = true
    await nextTick()
    assert.equal(table.drawerContext.action, 'create')
    store.getters.inDrawer = false
    await nextTick()
    assert.equal(table.drawerContext, null)
    assert.equal(active.$refs.ListTable, table)
    assert.equal(idle.$refs.ListTable.closeCount, idleCount)
  }
})
