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
        headerActions: {
          createRoute: 'WebCreate'
        },
        tableConfig: {
          columnsExclude: ['username_selector', 'password_selector', 'submit_selector', 'script'],
          columnsMeta: {
            autofill: {
              width: '100px'
            }
          }
        }
      }
    }
  }
}
</script>

<style>

</style>
