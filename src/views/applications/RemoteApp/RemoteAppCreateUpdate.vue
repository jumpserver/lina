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
      ],
      url: '/api/v1/applications/remote-apps/'
    }
  }
}
</script>

<style lang="less" scoped>
</style>
