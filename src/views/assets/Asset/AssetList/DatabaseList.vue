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
        category: 'database',
        url: '/api/v1/assets/databases/',
        addColumns: ['db_name'],
        extraHeaderActions: {
          createRoute: 'DatabaseCreate'
        }
      }
    }
  }
}
</script>

<style>

</style>
