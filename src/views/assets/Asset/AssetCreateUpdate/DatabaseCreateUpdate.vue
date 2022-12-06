<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'DatabaseCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/databases/',
      addFields: [
        [this.$t('common.Basic'), ['db_name']]
      ]
    }
  }
}
</script>

<style>
</style>
