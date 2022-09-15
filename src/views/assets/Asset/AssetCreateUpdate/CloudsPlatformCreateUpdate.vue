<template>
  <BaseCreateUpdate v-bind="$data" />
</template>

<script>
import BaseCreateUpdate from './components/BaseCreateUpdate'

export default {
  name: 'CloudCreateUpdate',
  components: { BaseCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/clouds/',
      addFields: [
        [this.$t('common.Basic'), ['cluster']]
      ]
    }
  }
}
</script>

<style>
</style>
