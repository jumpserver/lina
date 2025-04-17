<template>
  <BaseList v-bind="config" />
</template>

<script>
import BaseList from './components/BaseList'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      config: {
        url: '/api/v1/assets/directories/',
        category: 'ds',
        helpMessage: this.$t('DirectoryServiceHelpMessage')
      }
    }
  }
}
</script>
