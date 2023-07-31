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
        category: 'gpt',
        url: '/api/v1/assets/gpts/'
      }
    }
  }
}
</script>

<style>

</style>
