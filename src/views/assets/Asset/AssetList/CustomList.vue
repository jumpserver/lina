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
        category: 'custom',
        url: '/api/v1/assets/customs/',
        tableConfig: {
          columnsExclude: [
          ],
          columnsMeta: {
            autofill: {
              width: '100px'
            }
          }
        },
        helpMessage: this.$t('assets.CustomHelpMessage')
      }
    }
  }
}
</script>

<style>

</style>
