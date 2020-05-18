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
        },
        url: '/api/v1/users/groups/',
        fields: [
          [this.$t('common.Basic'), ['name', 'users', 'comment']]
        ],
        fieldsMeta: {
          users: {
            el: {
              value: [],
              url: '/api/v1/users/users/'
            }
          }
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
