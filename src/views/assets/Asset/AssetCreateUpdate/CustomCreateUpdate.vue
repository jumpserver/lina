<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'WebCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/customs/',
      addFields: [
        [this.$t('assets.Secure'), ['info'], 1]
      ],
      addFieldsMeta: {
        info: {
          fields: '__all__'
        }
      }
    }
  },
  mounted() {
    const platform = this.$route.query.platform
    if (platform) {
      this.url += `?platform=${platform}`
    }
  }
}
</script>

<style>
</style>
