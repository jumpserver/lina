<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {
          users: []
        },
        url: '/api/v1/terminal/applets/',
        fields: [
          [this.$t('common.Basic'), ['name']],
          [this.$t('common.Other'), ['comment']]
        ],
        fieldsMeta: {
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

</style>
