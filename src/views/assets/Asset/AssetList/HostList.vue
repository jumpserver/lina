<template>
  <BaseList
    :category="'host'"
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
        url: '/api/v1/assets/hosts/'
      },
      headerActions: {
        createRoute: 'HostCreate'
      }
    }
  }
}
</script>

<style>

</style>
