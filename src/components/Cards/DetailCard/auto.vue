<template>
  <DetailCard v-if="!loading && hasObject && items.length > 0" :items="items" v-bind="$attrs" />
</template>

<script>
import DetailCard from './index.vue'
import { copy, toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AutoDetailCard',
  components: { DetailCard },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      default: null
    },
    excludes: {
      type: Array,
      default: null
    },
    showUndefine: {
      type: Boolean,
      default: true
    },
    formatters: {
      type: Object,
      default: () => ({})
    },
    nested: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      items: [],
      loading: true
    }
  },
  computed: {
    iObject() {
      if (this.nested) {
        return this.object[this.nested] || {}
      } else {
        return this.object
      }
    },
    hasObject() {
      return Object.keys(this.iObject).length > 0
    }
  },
  async mounted() {
    await this.optionAndGenFields()
    this.loading = false
  },
  methods: {
    defaultFormatter(fields) {
      const formatter = {}
      for (const name of fields) {
        formatter[name] = function(item, val) {
          if (val === '-') {
            return <span>{'-'}</span>
          }
          return (<span style={{ cursor: 'pointer' }} onClick={() => copy(val)}>
            {val}
          </span>)
        }
      }
      return formatter
    },
    async optionAndGenFields() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      let remoteMeta = data.actions['GET'] || {}
      if (this.nested) {
        remoteMeta = remoteMeta[this.nested]?.children || {}
      }
      let fields = this.fields
      fields = fields || Object.keys(remoteMeta)
      const defaultExcludes = ['org_id']
      const excludes = (this.excludes || []).concat(defaultExcludes)
      fields = fields.filter(item => !excludes.includes(item))
      const defaultFormatter = this.defaultFormatter(fields)
      for (const name of fields) {
        if (typeof name === 'object') {
          this.items.push(name)
          continue
        }
        const fieldMeta = remoteMeta[name]
        if (!fieldMeta) {
          continue
        }
        if (fieldMeta['write_only']) {
          continue
        }

        let value = this.iObject[name]
        const label = fieldMeta.label

        if (Array.isArray(value)) {
          if (typeof value[0] === 'object') {
            const firstValue = value[0]
            if (firstValue.hasOwnProperty('name')) {
              value.forEach(item => {
                const fieldName = `${name}.${item.name}`
                if (excludes.includes(fieldName)) {
                  return
                }
                this.items.push({
                  key: item.label,
                  value: item.value
                })
              })
            } else {
              value.forEach((item, index) => {
                const v = Object.entries(item).map(([key, value]) => `${key}:${value}`).join(', ')
                const data = { value: v }
                if (index === 0) {
                  data['key'] = label
                }
                this.items.push(data)
              })
            }
          } else if (typeof value[0] === 'string') {
            value.forEach((item, index) => {
              let data = {}
              if (index === 0) {
                data = {
                  key: label,
                  value: value[index]
                }
              } else {
                data = {
                  value: value[index]
                }
              }
              this.items.push(data)
            })
          }
          continue
        }
        if (value === null || value === '') {
          value = '-'
        } else if (fieldMeta.type === 'datetime') {
          value = toSafeLocalDateStr(value)
        } else if (fieldMeta.type === 'labeled_choice') {
          value = value?.['label']
        } else if (fieldMeta.type === 'related_field' || fieldMeta.type === 'nested object') {
          value = value?.['name']
        } else if (fieldMeta.type === 'm2m_related_field') {
          value = value?.map(item => item['name']).join(', ')
        } else if (fieldMeta.type === 'boolean') {
          value = value ? this.$t('common.Yes') : this.$t('common.No')
        }

        if (value === undefined) {
          if (this.showUndefine) {
            value = '-'
          } else {
            continue
          }
        }

        const item = {
          key: label,
          value: value,
          formatter: this.formatters[name] || defaultFormatter[name]
        }
        this.items.push(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
