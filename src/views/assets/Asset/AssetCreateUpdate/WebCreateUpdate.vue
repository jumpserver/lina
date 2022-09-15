<template>
  <BaseCreateUpdate v-bind="$data" />
</template>

<script>
import BaseCreateUpdate from './components/BaseCreateUpdate'

export default {
  name: 'WebCreateUpdate',
  components: { BaseCreateUpdate },
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
