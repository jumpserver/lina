# 详情 Formatter

`DetailCard` 使用 `item.component` 渲染完整的字段内容组件；普通值仍由 `ItemValue` 和 `formatter(item, value)` 展示。卡片负责布局，formatter 组件可以承载标签、链接、复杂内容或完整的行内编辑交互。

## EditableFormatter

通过现有的 `component` 入口配置，无需在 `DetailCard` 中声明编辑能力：

```vue
<DetailCard :items="items" />
```

```js
import { markRaw } from 'vue'
import EditableFormatter from '@/components/Cards/Formatters/EditableFormatter.vue'

// items 由资源数据派生，例如在 computed 中生成。
items: [
  {
    component: markRaw(EditableFormatter),
    field: 'name', // API 字段名，与展示标签 key 分开
    key: this.$t('Name'),
    value: this.asset.name,
    url: this.url,
    permission: 'assets.change_asset',
    inputProps: { maxlength: 128 },
    validate: (value) => value.trim() ? '' : this.$t('ThisFieldIsRequired'),
    onUpdated: ({ field, value }) => { this.asset[field] = value }
  }
]
```

`DetailCard` 把整个字段配置通过 `v-bind` 交给组件，并通过 `item` 传递原始字段配置。`AutoDetailCard` 的 `fields` 也支持这些字段对象；每个可编辑 formatter 应自行配置 `url` 或 `save`。

## 展示与编辑

`EditableFormatter` 默认使用 `ItemValue` 展示原始值。可以传入 `formatter(item, value)` 格式化展示，也可以用 `displayComponent` 和 `displayProps` 展示标签、链接等自定义内容。直接使用组件时，默认插槽提供 `{ value, item, edit }`，允许自定义整块只读内容。

`inputComponent` 指定编辑时的输入组件，默认为 `el-input`。例如手机号：

```js
{
  component: markRaw(EditableFormatter),
  field: 'phone',
  key: this.$t('Phone'),
  value: this.object.phone,
  url: this.url,
  formatter: (item, value) => value?.phone ? `${value.code} ${value.phone}` : '-',
  inputComponent: markRaw(PhoneInput),
  valueProp: 'value',
  changeEvent: 'change',
  onUpdated: ({ value }) => { this.object.phone = value }
}
```

`value` 应保留原始类型，展示格式在 formatter 内处理。组件也可接收 `object`，优先使用 `object[field]` 初始化草稿，便于获取原始值和保存上下文。

## 参数

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `field` | 必填 | API 字段名 |
| `label` | `item.key` 或 `field` | 编辑按钮和输入控件的无障碍名称 |
| `formatter` | 无 | 默认 `ItemValue` 使用的展示函数 |
| `displayComponent` / `displayProps` | 无 / `{}` | 自定义只读展示组件及属性 |
| `inputComponent` / `inputProps` | `'el-input'` / `{}` | 输入组件及属性；组件对象建议用 `markRaw` 包裹 |
| `valueProp` / `changeEvent` | `'modelValue'` / `'update:modelValue'` | 输入值属性和更新草稿的事件 |
| `disabled` | `false` | 禁止编辑，可由页面 computed 动态计算 |
| `permission` | 无 | 使用 `$hasPerm` 检查；开始编辑和提交前都会检查 |
| `url` | 无 | 默认 PATCH 地址 |
| `validate(value, context)` | 无 | 可异步；返回错误文案阻止提交，返回空值继续 |
| `save(value, context)` | 默认 PATCH | 自定义保存回调，返回资源对象或空响应 |

`context` 包含 `{ field, item, object }`。默认保存只发送 `{ [field]: value }`，使用项目配置的 axios 客户端。成功后优先使用响应中的字段值；空响应使用提交值。通过 `updated({ field, value, response })` 事件通知页面更新资源或刷新数据。

草稿从原值深拷贝。取消不发送请求；校验或保存失败保留草稿并显示错误。保存期间禁止修改和重复提交，自定义输入组件需支持 `disabled` 属性。没有保存地址、保存回调或编辑权限时，只显示内容。
