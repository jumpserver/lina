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
        url: '/api/v1/assets/devices/',
        category: 'device'
      }
    }
  }
}
</script>

<style>

</style>
