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
      ],
      updateInitial(initial) {
        initial['address'] = 'https://api.openai.com/v1/'
        return initial
      }
    }
  }
}
</script>

<style>
</style>
