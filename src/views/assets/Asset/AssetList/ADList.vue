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
        category: 'ad',
        url: '/api/v1/assets/directories/'
      }
    }
  }
}
</script>
