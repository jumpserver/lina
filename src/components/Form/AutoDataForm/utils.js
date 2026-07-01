// Vue dependency removed; use console for debug logs
import { markRaw } from 'vue'
import ObjectSelect2 from '@/components/Form/FormFields/NestedObjectSelect2.vue'
import NestedField from '@/components/Form/AutoDataForm/components/NestedField.vue'
import rules from '@/components/Form/DataForm/rules'
import BasicTree from '@/components/Form/FormFields/BasicTree.vue'
import JsonEditor from '@/components/Form/FormFields/JsonEditor.vue'
import { assignIfNot, toSentenceCase } from '@/utils/common/index'
import TagInput from '@/components/Form/FormFields/TagInput.vue'
import i18n from '@/i18n/i18n'
import _ from 'lodash'

export class FormFieldGenerator {
  constructor() {
    this.groups = []
  }

  generateFieldByType(type, field, fieldMeta, fieldRemoteMeta) {
    switch (type) {
      case 'labeled_choice':
      case 'choice':
        // Value 处理事在 AutoDataForm 中处理的
        if (!fieldRemoteMeta['read_only']) {
          field.options = fieldRemoteMeta.choices
        }
        type = 'radio-group'
        break
      case 'multiple choice':
        field.options = fieldRemoteMeta.choices
        type = 'checkbox-group'
        break
      case 'tree':
        field.el.tree = fieldRemoteMeta.tree
        field.component = markRaw(BasicTree)
        break
      case 'datetime':
        type = 'date-picker'
        field.el = {
          type: 'datetime'
        }
        break
      case 'json':
        type = 'json-editor'
        field.component = markRaw(JsonEditor)
        break
      case 'field':
        type = ''
        field.component = markRaw(ObjectSelect2)
        if (fieldRemoteMeta.required) {
          field.el.clearable = false
        }
        field.el.label = field.label
        // if (fieldRemoteMeta.child && fieldRemoteMeta.child.type === 'nested object') {
        //   field.component = ObjectSelect2
        // }
        break
      case 'string':
        type = 'input'
        if (!fieldRemoteMeta['max_length']) {
          field.el.type = 'textarea'
          field.el.rows = 3
        }
        if (fieldRemoteMeta['write_only']) {
          field.el.type = 'password'
        }
        break
      case 'boolean':
        type = 'checkbox'
        // field.component = Switcher
        // field.type = 'checkbox'
        break
      case 'list':
        type = 'input'
        field.component = markRaw(TagInput)
        break
      case 'object_related_field':
        field.component = markRaw(ObjectSelect2)
        break
      case 'm2m_related_field':
        field.component = markRaw(ObjectSelect2)
        field.el.label = field.label
        break
      case 'nested object':
        // 属性映射这类字段后端类型是 nested object，但没有 children。调用方通过
        // fieldMeta.component（如 JsonEditor）指定用自定义组件渲染整个 JSON 值，
        // 而非展开成嵌套子表单。此时不走 nestedField 逻辑：保留 label，按普通
        // 自定义组件字段处理（type 置空，由后续 Object.assign 注入的 component 渲染）。
        if (fieldMeta.component) {
          type = ''
          break
        }
        type = 'nestedField'
        field.component = markRaw(NestedField)
        field.label = ''
        field.labelWidth = 0
        field.attrs = {
          ...field.attrs,
          labelWidth: '0px'
        }
        field.el = { ...field.el, ...fieldMeta }
        field.el.fields = this.generateNestFields(field, fieldMeta, fieldRemoteMeta)
        field.el.errors = {}
        field.hidden = () => {
          const hidden = fieldMeta['hiddenFields'] || (() => field.el.fields.length === 0)
          return hidden(fieldMeta, fieldRemoteMeta, field.el.fields)
        }
        break
      default:
        type = 'input'
        break
    }
    // 上面重写了 type
    if (type === 'radio-group') {
      if (field.options.length > 4) {
        type = 'select'
        field.el.filterable = true
      }
    }

    field.type = type
    return field
  }

  generateNestFields(field, fieldMeta, fieldRemoteMeta) {
    const fields = []
    let nestedFields = fieldMeta.fields || []
    const nestedFieldsMeta = fieldMeta.fieldsMeta || {}
    const nestedFieldsRemoteMeta = fieldRemoteMeta.children || {}
    if (nestedFields.toString() === '__all__') {
      nestedFields = Object.keys(nestedFieldsRemoteMeta)
    }
    for (const name of nestedFields) {
      const f = this.generateField(name, nestedFieldsMeta, nestedFieldsRemoteMeta)
      fields.push(f)
    }
    console.debug('NestFields: ', fields)
    return fields
  }

  generateFieldByName(name, field) {
    switch (name) {
      case 'email':
        field.el.type = 'email'
        break
      case 'password':
        field.el.type = 'password'
        break
      case 'comment':
        field.el.type = 'textarea'
        break
    }
    return field
  }

  generateFieldByOther(field, fieldMeta, fieldRemoteMeta) {
    const filedRules = field.rules || []
    if (fieldRemoteMeta.required) {
      if (field.type === 'input') {
        filedRules.push(rules.Required)
      } else {
        filedRules.push(rules.RequiredChange)
      }
    }
    // 一些 field 有 choices 但不是 choiceField
    if (fieldRemoteMeta.choices && field.type.indexOf('choice') === -1) {
      field.el.choices = fieldRemoteMeta.choices
    }
    field.rules = filedRules
    return field
  }

  setHelpText(field, remoteFieldMeta) {
    let helpText = toSentenceCase(remoteFieldMeta['help_text'])

    if (!helpText) {
      return field
    }

    let helpTextAsTip = field.helpTextAsTip
    if (helpTextAsTip === undefined && !helpText.startsWith('*')) {
      helpTextAsTip = true
    } else {
      helpText = helpText.replace(/^\*/, '')
    }

    let helpTextAsPlaceholder = field.helpTextAsPlaceholder
    const helpTextWordLength = helpText.split(' ').length
    const placeholderType = ['input', 'select', 'm2m_related_field']
    const placeholderComponent = [ObjectSelect2]

    const systemLang = document.cookie.django_language
    if (helpTextAsPlaceholder !== undefined) {
      helpTextAsPlaceholder = !!helpTextAsPlaceholder
    } else if (
      placeholderType.indexOf(field.type) === -1 &&
      placeholderComponent.indexOf(field.component) === -1
    ) {
      helpTextAsPlaceholder = false
    } else if ((helpTextWordLength <= 5 || helpText.length <= 10) && systemLang === 'en') {
      helpTextAsPlaceholder = true
    }

    if (helpTextAsPlaceholder) {
      field.placeholder = field.placeholder || helpText
    } else if (helpTextAsTip) {
      field.helpTip = field.helpTip || helpText
    } else {
      field.helpText = field.helpText || helpText
    }
    return field
  }

  setChoicesTips(field, fieldMeta, fieldRemoteMeta) {
    // 设置 checkbox 的 tips
    if (['checkbox-group', 'radio-group'].indexOf(field.type) !== -1) {
      field.options.map((option) => {
        if (!option.tip && field.tips) {
          option.tip = field.tips[option.value]
        }
        if (!option.tip) {
          const match = option.label.match(/^(.+?)\s*\((.*?)\)$/)
          if (match) {
            option.label = match[1]
            option.tip = match[2]
          }
        }
      })
    }
  }

  afterGenerateField(field) {
    field.label = toSentenceCase(field.label)

    if (field.placeholder) {
      field.el.placeholder = field.placeholder
    }

    this.setChoicesTips(field)
    return field
  }

  generateField(name, fieldsMeta, remoteFieldsMeta) {
    let field = { id: name, prop: name, el: {}, attrs: {}, rules: [] }
    const remoteFieldMeta = remoteFieldsMeta[name] || {}
    const fieldMeta = fieldsMeta[name] || {}
    field.label = remoteFieldMeta.label
    field = this.generateFieldByType(remoteFieldMeta.type, field, fieldMeta, remoteFieldMeta)
    field = this.generateFieldByName(name, field)
    field = this.generateFieldByOther(field, fieldMeta, remoteFieldMeta)
    const el = assignIfNot(fieldMeta.el || {}, field.el)
    const rules = fieldMeta.rules || field.rules
    field = Object.assign(field, fieldMeta)
    field.el = el
    field.rules = rules
    field = this.setHelpText(field, remoteFieldMeta)
    field = this.setPlaceholder(field, remoteFieldMeta)
    field = this.afterGenerateField(field)
    _.set(field, 'attrs.error', '')
    console.debug('Generate field: ', name, field)
    return field
  }

  setPlaceholder(field, remoteFieldMeta) {
    const label = field.label
    if (!label) {
      return field
    }
    if (field.placeholder || field.el.placeholder) {
      return field
    }
    if (field.type === 'select' || [ObjectSelect2].indexOf(field.component) > -1) {
      field.el.placeholder = i18n.global.t('PleaseSelect') + label.toLowerCase()
    } else if (field.type === 'input') {
      field.el.placeholder = field.label
    }
    return field
  }

  generateFieldGroup(field, fieldsMeta, remoteFieldsMeta) {
    const [groupTitle, fields] = field
    const _fields = this.generateFields(fields, fieldsMeta, remoteFieldsMeta)
    const group = {
      id: groupTitle,
      title: groupTitle,
      fields: _fields,
      name: _fields[0]?.id
    }
    this.groups.push(group)
    return _fields
  }

  generateFields(_fields, fieldsMeta, remoteFieldsMeta) {
    let fields = []
    if (_fields === '__all__') {
      _fields = Object.keys(remoteFieldsMeta)
    }
    for (let field of _fields) {
      if (field instanceof Array) {
        const items = this.generateFieldGroup(field, fieldsMeta, remoteFieldsMeta)
        fields = [...fields, ...items]
      } else if (typeof field === 'string') {
        field = this.generateField(field, fieldsMeta, remoteFieldsMeta)
        fields.push(field)
      } else if (field instanceof Object) {
        if (this.errors) {
          this.errors[field.prop] = ''
        }
        // Wrap component with markRaw to prevent Vue from making it reactive
        if (field.component && typeof field.component !== 'string') {
          field.component = markRaw(field.component)
        }
        fields.push(field)
      }
    }
    return fields
  }
}
