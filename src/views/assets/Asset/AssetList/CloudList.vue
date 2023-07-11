<template>
  <BaseList v-bind="tableConfig" />
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
        category: 'cloud',
        url: '/api/v1/assets/clouds/'
      }
    }
  }
}
</script>

<style>

</style>
