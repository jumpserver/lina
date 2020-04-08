<template>
  <DataForm v-loading="loading" :fields="totalFields" v-bind="$attrs" v-on="$listeners">
    <slot v-for="item in fields" :slot="`id:${item}`" :name="`id:${item}`" />
    <slot v-for="item in fields" :slot="`$id:${item}`" :name="`$id:${item}`" />
  </DataForm>
</template>

<script>
import DataForm from '../DataForm'
import { optionUrlMeta } from '@/api/common'
import rules from '@/components/DataForm/rules'
import Select2 from '@/components/Select2'
export default {
  name: 'AutoDataForm',
  components: {
    DataForm
  },
  props: {
    url: {
      type: String,
      required: true
    },
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    fieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      meta: {},
      totalFields: [],
      loading: true
    }
  },
  computed: {
  },
  mounted() {
    this.optionUrlMeta()
    console.log('auto data form', this.$attrs)
  },
  methods: {
    optionUrlMeta() {
      optionUrlMeta(this.url).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateFields()
        this.loading = false
      })
    },
    generateFieldByType(type, field, fieldMeta) {
      switch (type) {
        case 'choice':
          type = 'radio-group'
          field.options = fieldMeta.choices.map(v => {
            return { label: v.display_name, value: v.value }
          })
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
          break
        default:
          type = 'input'
          break
      }
      field.type = type
      return field
    },
    generateFieldByName(name, field) {
      switch (name) {
        case 'email':
          field.el = { type: 'email' }
          break
        case 'password':
          field.el = { type: 'password' }
          break
        case 'comment':
          field.el = { type: 'textarea' }
          break
      }
      return field
    },
    generateFieldByOther(field, fieldMeta) {
      if (fieldMeta.required) {
        if (field.type === 'input') {
          field.rules = [rules.Required]
        } else {
          field.rules = [rules.RequiredChange]
        }
      }
      return field
    },
    generateField(name) {
      let field = {}
      const fieldMeta = this.meta[name] || {}
      field.id = name
      field.label = fieldMeta.label
      field = this.generateFieldByType(fieldMeta.type, field, fieldMeta)
      field = this.generateFieldByName(name, field)
      field = this.generateFieldByOther(field, fieldMeta)

      field = Object.assign(field, this.fieldsMeta[name] || {})
      return field
    },
    generateFields() {
      const fields = []
      for (let field of this.fields) {
        if (typeof field === 'object') {
          fields.push(field)
        } else if (typeof field === 'string') {
          field = this.generateField(field)
          fields.push(field)
        }
      }
      this.totalFields = fields
    }
  }
}
</script>

<style scoped>

</style>
