<template>
  <GenericCreateUpdatePage v-bind="$data" @validate="console.log('hello')" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [this.$t('route.DatabaseApp'), ['name', 'type', 'host', 'port', 'database', 'comment']]
      ],
      url: '/api/v1/applications/database-apps/'
    }
  }
}
</script>

<style lang="less" scoped>

</style>
