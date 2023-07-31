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
        category: 'web',
        url: '/api/v1/assets/webs/',
        tableConfig: {
          columnsExclude: [
            'username_selector', 'password_selector', 'submit_selector',
            'script', 'spec_info', 'info', 'auto_config'
          ],
          columnsMeta: {
            autofill: {
              width: '100px'
            }
          }
        },
        helpMessage: this.$t('assets.WebHelpMessage')
      }
    }
  }
}
</script>

<style>

</style>
