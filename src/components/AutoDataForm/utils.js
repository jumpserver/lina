import Vue from 'vue'
import Select2 from '@/components/FormFields/Select2'
import NestedField from '@/components/AutoDataForm/components/NestedField'
import rules from '@/components/DataForm/rules'
import { assignIfNot } from '@/utils/common'

export class FormFieldGenerator {
  constructor() {
    this.groups = []
  }
  generateFieldByType(type, field, fieldMeta, fieldRemoteMeta) {
    switch (type) {
      case 'choice':
        type = 'radio-group'
        if (!fieldRemoteMeta.read_only) {
          field.options = fieldRemoteMeta.choices.map(v => {
            return { label: v.display_name, value: v.value }
          })
        }
        break
      case 'multiple choice':
        field.el.choices = fieldRemoteMeta['choices']
        break
      case 'datetime':
        type = 'date-picker'
        field.el = {
          type: 'datetime'
        }
        break
      case 'field':
        type = ''
        field.component = Select2
        if (fieldRemoteMeta.required) {
          field.el.clearable = false
        }
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
        break
      case 'nested object':
        type = 'nestedField'
        field.component = NestedField
        field.label = ''
        field.labelWidth = 0
        field.el.fields = this.generateNestFields(field, fieldMeta, fieldRemoteMeta)
        field.el.errors = {}
        Vue.$log.debug('All fields in generate: ', field.el.allFields)
        break
      default:
        type = 'input'
        break
    }
    if (type === 'radio-group') {
      if (!fieldRemoteMeta.read_only) {
        const options = fieldRemoteMeta.choices.map(v => {
          return { label: v.display_name, value: v.value }
        })
        if (options.length > 4) {
          type = 'select'
          field.el.filterable = true
        }
      }
    }
    field.type = type
    return field
  }
  generateNestFields(field, fieldMeta, fieldRemoteMeta) {
    const fields = []
    const nestedFields = fieldMeta.fields || []
    const nestedFieldsMeta = fieldMeta.fieldsMeta || {}
    const nestedFieldsRemoteMeta = fieldRemoteMeta.children || {}
    for (const name of nestedFields) {
      const f = this.generateField(name, nestedFieldsMeta, nestedFieldsRemoteMeta)
      fields.push(f)
    }
    Vue.$log.debug('NestFields: ', fields)
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
    field.rules = filedRules
    return field
  }
  generateField(name, fieldsMeta, remoteFieldsMeta) {
    let field = { id: name, prop: name, el: {}, attrs: {}, rules: [] }
    const remoteFieldMeta = remoteFieldsMeta[name] || {}
    const fieldMeta = fieldsMeta[name] || {}
    field.label = remoteFieldMeta.label
    field.helpText = remoteFieldMeta.help_text
    field = this.generateFieldByType(remoteFieldMeta.type, field, fieldMeta, remoteFieldMeta)
    field = this.generateFieldByName(name, field)
    field = this.generateFieldByOther(field, fieldMeta, remoteFieldMeta)
    const el = assignIfNot(fieldMeta.el || {}, field.el)
    const rules = fieldMeta.rules || field.rules
    field = Object.assign(field, fieldMeta)
    field.el = el
    field.rules = rules
    _.set(field, 'attrs.error', '')
    // Vue.$log.debug('Generate field: ', name, field)
    return field
  }
  generateFieldGroup(field, fieldsMeta, remoteFieldsMeta) {
    const [groupTitle, fields] = field
    this.groups.push({
      id: groupTitle,
      title: groupTitle,
      name: fields[0],
      fields: fields
    })
    return this.generateFields(fields, fieldsMeta, remoteFieldsMeta)
  }
  generateFields(_fields, fieldsMeta, remoteFieldsMeta) {
    let fields = []
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
        fields.push(field)
      }
    }
    return fields
  }
}
