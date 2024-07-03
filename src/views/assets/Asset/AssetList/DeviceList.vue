<template>
  <BaseList v-bind="config" :table-config="tableConfig" />
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
      },
      tableConfig: {
        columnsExclude: ['date_verified']
      }
    }
  }
}
</script>
