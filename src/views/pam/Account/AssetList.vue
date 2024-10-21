<template>
  <BaseList :table-config="tableConfig" v-bind="config" />
</template>

<script>
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      config: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      tableConfig: {
        columnsExclude: ['date_verified']
      }
    }
  }
}
</script>
