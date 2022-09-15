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
      url: '/api/v1/assets/web/',
      addFields: [
        [this.$t('common.Basic'), ['url']]
      ]
    }
  }
}
</script>

<style>
</style>
