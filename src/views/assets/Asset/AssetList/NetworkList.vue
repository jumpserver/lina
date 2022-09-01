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
        url: '/api/v1/assets/networks/',
        category: 'networking',
        headerActions: {
          createRoute: 'NetworkingCreate'
        }
      }
    }
  }
}
</script>

<style>

</style>
