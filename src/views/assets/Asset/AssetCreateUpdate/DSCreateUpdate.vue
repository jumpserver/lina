<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'DSCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/directories/',
      addFields: [
        [this.$t('IdentityDomain'), ['domain_name'], 1]
      ]
    }
  }
}
</script>

<style>
</style>
