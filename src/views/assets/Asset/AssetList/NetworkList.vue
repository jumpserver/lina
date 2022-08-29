<template>
  <BaseList
    :category="'networking'"
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
        url: '/api/v1/assets/networking/'
      },
      headerActions: {
        createRoute: 'NetworkingCreate'
      }
    }
  }
}
</script>

<style>

</style>
