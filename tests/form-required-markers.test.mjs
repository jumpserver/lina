import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import { renderToString } from '@vue/server-renderer'
import { ElForm, ElFormItem } from 'element-plus'
import * as Vue from 'vue'

const source = await readFile(
  new URL(
    '../src/components/Form/DataForm/components/el-form-renderer/components/render-form-item.vue',
    import.meta.url
  ),
  'utf8'
)
const render = new Function(
  'Vue',
  compile(parse(source).descriptor.template.content, { mode: 'function' }).code
)(Vue)

async function renderField(data, value = {}) {
  const fields = []
  const formItem = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      fields.push(attrs)
      return () => Vue.h(ElFormItem, attrs, slots)
    }
  })
  const field = {
    render() {
      return render(
        {
          data: { label: 'Account', ...data },
          value,
          _show: true,
          collapsed: false,
          classes: '',
          itemProp: 'account',
          errorText: '',
          readonly: false,
          hasReadonlyContent: false,
          rawComponent: 'input',
          componentProps: {},
          disabled: false,
          itemValue: '',
          valueProp: '',
          listeners: {},
          options: [],
          helpText: '',
          helpTextContent: ''
        },
        []
      )
    }
  }
  const app = Vue.createSSRApp({
    render: () => Vue.h(ElForm, { model: value }, () => Vue.h(field))
  })
  app.component('el-form-item', formItem)
  const html = await renderToString(app)
  assert.equal(fields[0].rules, data.rules, 'marker must preserve the existing validation rules')
  assert.equal(
    fields[0].required,
    undefined,
    'marker must not inject an Element Plus required validator'
  )
  return html
}

test('explicit required fields display their marker without hiding it or adding validation', async () => {
  const rules = [{ validator: (_, value, done) => done() }]
  const html = await renderField({ required: true, rules })
  assert.match(html, /class="[^"]*\bis-required\b/)
  assert.doesNotMatch(html, /is-no-asterisk/)
})

test('conditional markers follow form values and standard required rules still display', async () => {
  const data = { required: (value) => !value.nodes.length, rules: [] }
  for (const nodes of [[], ['node-a'], []]) {
    const html = await renderField(data, { nodes })
    assert.equal(/class="[^"]*\bis-required\b/.test(html), !nodes.length)
  }
  const html = await renderField({ rules: [{ required: true }] })
  assert.match(html, /class="[^"]*\bis-required\b/)
  assert.doesNotMatch(await renderField({ required: false, rules: [] }), /\bis-required\b/)
})
