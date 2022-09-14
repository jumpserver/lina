<template>
  <BaseCreateUpdate v-bind="$data" />
</template>

<script>
import BaseCreateUpdate from './components/BaseCreateUpdate'

export default {
  name: 'DatabaseCreateUpdate',
  components: { BaseCreateUpdate },
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
