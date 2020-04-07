<template>
  <DataForm v-loading="loading" :fields="totalFields" v-bind="$attrs" v-on="$listeners">
    <slot v-for="item in totalFields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in totalFields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />
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
      // required: true,
      default: '/api/v1/users/users/'
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
  },
  methods: {
    optionUrlMeta() {
      optionUrlMeta(this.url).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateFields()
        this.loading = false
      })
    },
    generateField(name) {
      let field = {}
      const fieldMeta = this.meta[name] || {}
      field.id = name
      field.label = fieldMeta.label

      let type = 'input'
      switch (fieldMeta.type) {
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
      if (fieldMeta.required) {
        if (type === 'input') {
          field.rules = [rules.Required]
        } else {
          field.rules = [rules.RequiredChange]
        }
      }
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
