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
        url: '/api/v1/assets/web/',
        headerActions: {
          createRoute: 'WebCreate'
        }
      }
    }
  }
}
</script>

<style>

</style>
