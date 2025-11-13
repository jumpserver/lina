<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'CloudCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/clouds/',
      addFields: this.getAddFields(),
      addFieldsMeta: this.getAddFieldsMeta()
    }
  },
  methods: {
    getAddFields() {
      const platform = this.$route.query.type
      const baseFields = []

      if (platform === 'k8s') {
        baseFields.push([this.$t('Basic'), ['namespace'], 1])
      }

      return baseFields
    },
    getAddFieldsMeta() {
      const platform = this.$route.query.type
      const fieldsMeta = {}

      if (platform === 'k8s') {
        fieldsMeta['namespace'] = {
          label: this.$t('DefaultNamespace')
        }
      }

      return fieldsMeta
    }
  }
}
</script>

<style>
</style>
