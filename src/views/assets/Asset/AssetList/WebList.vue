<template>
  <BaseList
    :category="'web'"
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
</template>

<script>
import BaseList from './components/BaseList'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/webs/'
      },
      headerActions: {
        createRoute: 'WebCreate'
      }
    }
  }
}
</script>

<style>

</style>
