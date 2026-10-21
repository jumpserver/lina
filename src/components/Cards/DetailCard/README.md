# DetailCard 行内编辑

`formatter(item, value)` 负责只读展示；`editor` 负责编辑。未配置 `editor` 的字段保持只读。

```vue
<DetailCard :items="items" :object="asset" :url="url" @updated="onUpdated" />
```

```js
items: [
  {
    field: 'name', // API 字段名，与展示标签 key 分开
    key: this.$t('Name'),
    value: this.asset.name,
    editor: {
      permission: 'assets.change_asset',
      props: { maxlength: 128 },
      validate: (value) => value.trim() ? '' : this.$t('ThisFieldIsRequired')
    }
  },
  {
    field: 'is_active',
    key: this.$t('IsActive'),
    value: this.asset.is_active,
    editor: { component: 'el-switch', permission: 'assets.change_asset' }
  }
]

onUpdated({ field, value }) {
  this.asset[field] = value
}
```

`items` 应由资源数据派生（如 computed），使外部刷新同步到只读展示。`object` 用于获取编辑前的原始值；未提供对应属性时使用 `item.value`。`AutoDetailCard` 的 `fields` 也可以传入上述字段对象，`object` 和 `url` 会继续传递给 `DetailCard`。

## editor 配置

`editor: true` 使用默认 `el-input`。对象配置支持：

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `component` | `'el-input'` | 输入组件名称或组件对象；组件对象建议用 `markRaw` 包裹 |
| `props` | `{}` | 传给输入组件的属性，如 `options`、`type`、`maxlength` |
| `valueProp` | `'modelValue'` | 输入值属性名 |
| `changeEvent` | `'update:modelValue'` | 更新草稿的事件名 |
| `disabled` | `false` | 禁止编辑，可由页面 computed 动态计算 |
| `permission` | 无 | 通过 `$hasPerm` 检查的权限；保存前再次检查 |
| `url` | 卡片的 `url` | 覆盖当前字段的 PATCH 地址 |
| `validate(value, context)` | 无 | 可异步；返回错误文案阻止提交，返回空值则继续 |
| `save(value, context)` | 默认 PATCH | 自定义保存回调，返回资源对象或空响应 |

`context` 包含 `{ field, item, object }`。默认保存只发送 `{ [field]: value }`，并使用项目配置的 axios 客户端。成功后优先使用响应中的字段值；空响应使用提交值。组件触发 `updated({ field, value, response })`，由页面更新资源或重新获取数据。

例如，旧式 `value` / `change` 控件可以这样接入：

```js
editor: {
  component: markRaw(PhoneInput),
  valueProp: 'value',
  changeEvent: 'change'
}
```

草稿从原值深拷贝。取消不发送请求；校验或保存失败保留草稿并显示错误。保存期间禁用输入、保存和取消，防止重复提交。自定义组件需支持 `disabled` 属性。

原有 `component`、`formatter` 和字段内容插槽继续负责展示。插槽可通过 `{ item, value }` 获取保存后的当前值。
