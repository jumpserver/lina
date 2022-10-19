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
      url: '/api/v1/assets/webs/',
      addFields: [
        [this.$t('common.Selector'), ['username_selector', 'password_selector', 'submit_selector']]
      ]
    }
  }
}
</script>

<style>
</style>
