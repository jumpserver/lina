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
      default: () => []
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
      console.log('remoteMeta', remoteMeta)
      for (const name of this.fields) {
        if (typeof name === 'object') {
          this.items.push(name)
          continue
        }
        const fieldMeta = remoteMeta[name]
        console.log('Field meta', name, fieldMeta)
        if (!fieldMeta) {
          continue
        }

        let value = this.object[name]
        const label = fieldMeta.label
        if (value === undefined || value === null || value === '') {
          value = '-'
        } else if (fieldMeta.type === 'datetime') {
          value = toSafeLocalDateStr(value)
        } else if (fieldMeta.type === 'labeled_choice') {
          value = value['label']
        } else if (fieldMeta.type === 'related_field') {
          value = value['name']
        } else if (fieldMeta.type === 'm2m_related_field') {
          value = value.map(item => item['name']).join(', ')
        } else if (fieldMeta.type === 'boolean') {
          value = value ? this.$t('Yes') : this.$t('No')
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
