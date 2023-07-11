<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'GPTCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/gpts/',
      addFields: [
        [this.$t('common.Proxy'), ['proxy'], 1]
      ]
    }
  }
}
</script>

<style>
</style>
