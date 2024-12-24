<template>
  <IBox v-if="loading" style="width: 100%; height: 200px" />
  <div v-else>
    <DetailCard
      v-if="hasObject && items.length > 0"
      :items="validItems"
      :loading="loading"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import DetailCard from './index.vue'
import { copy } from '@/utils/common'
import { toSafeLocalDateStr } from '@/utils/time'
import IBox from '@/components/IBox/index.vue'
import LabelsDetailFormatter from '../Formatters/LabelsDetailFormatter.vue'

export default {
  name: 'AutoDetailCard',
  components: { IBox, DetailCard },
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
    },
    validItems() {
      return this.items.filter(item => this.isHidden(item))
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
          return (
            <span style={{ cursor: 'pointer' }} onClick={() => copy(val)} title={val}>
              {val}
            </span>
          )
        }
      }
      return formatter
    },
    isHidden(item) {
      let has = item.has
      if (typeof has === 'function') {
        has = has()
      }
      if (has === undefined) {
        has = true
      }
      return has
    },
    parseValue(value, tp) {
      if (value === null || value === '') {
        value = '-'
      } else if (value === 0) {
        value = 0
      } else if (tp === 'datetime') {
        value = toSafeLocalDateStr(value)
      } else if (tp === 'labeled_choice') {
        value = value?.['label']
      } else if (tp === 'related_field' || tp === 'nested object' || value?.name) {
        value = value?.['name']
      } else if (tp === 'm2m_related_field') {
        value = value?.map(item => item['name']).join(', ')
      } else if (tp === 'boolean') {
        value = value ? this.$t('Yes') : this.$t('No')
      }
      return value
    },
    getComponentByName(name) {
      if (name === 'labels') {
        return LabelsDetailFormatter
      }
      return null
    },
    parseArrayValue(value, excludes, label) {
      if (Array.isArray(value)) {
        const tp = typeof value[0]
        for (const [index, item] of value.entries()) {
          let object = {}
          if (tp === 'object') {
            const firstValue = value[0]
            if (firstValue.hasOwnProperty('name')) {
              value.forEach(item => {
                const fieldName = `${name}.${item.name}`
                if (excludes.includes(fieldName)) {
                  return
                }
                object = {
                  key: item.label,
                  value: item.value
                }
              })
            } else {
              const fieldName = `${name}.${item.name}`
              if (excludes.includes(fieldName)) {
                continue
              }
              object = {
                key: item.label,
                value: item.value
              }
            }
          } else if (tp === 'string') {
            object = {
              value: value[index]
            }
            if (index === 0) {
              object['key'] = label
            }
          }
          if (index !== value.length - 1) {
            object['class'] = 'array-item'
          }
          this.items.push(object)
        }
      }
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

        const component = this.getComponentByName(name)
        if (component) {
          this.items.push({
            key: label,
            value: value,
            component: component
          })
          continue
        }

        const formatter = this.formatters[name]
        if (formatter) {
          this.items.push({
            key: label,
            value: value,
            formatter: formatter
          })
          continue
        }

        if (Array.isArray(value)) {
          this.parseArrayValue(value, excludes, label)
          continue
        }
        value = this.parseValue(value, fieldMeta.type)

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
          formatter: defaultFormatter[name]
        }
        this.items.push(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
