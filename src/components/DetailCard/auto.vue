<template>
  <DetailCard v-if="!loading" :items="items" v-bind="$attrs" />
</template>

<script>
import DetailCard from './index'
import { toSafeLocalDateStr } from '@/utils/common'

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
    }
  },
  data() {
    return {
      items: [],
      loading: true
    }
  },
  async mounted() {
    await this.optionAndGenFields()
    this.loading = false
  },
  methods: {
    async optionAndGenFields() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      const remoteMeta = data.actions['GET'] || {}
      let fields = this.fields
      fields = fields || Object.keys(remoteMeta)
      const defaultExcludes = ['org_id']
      const excludes = (this.excludes || []).concat(defaultExcludes)
      fields = fields.filter(item => !excludes.includes(item))
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

        let value = this.object[name]

        if (Array.isArray(value)) {
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
          continue
        }
        const label = fieldMeta.label
        if (value === null || value === '') {
          value = '-'
        } else if (fieldMeta.type === 'datetime') {
          value = toSafeLocalDateStr(value)
        } else if (fieldMeta.type === 'labeled_choice') {
          value = value?.['label']
        } else if (fieldMeta.type === 'related_field') {
          value = value['name']
        } else if (fieldMeta.type === 'm2m_related_field') {
          value = value.map(item => item['name']).join(', ')
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
          value: value
        }
        this.items.push(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
