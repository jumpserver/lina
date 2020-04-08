<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'role', 'groups_display', 'source', 'is_valid', 'actions'
        ],
        detailRoute: 'UserDetail',
      },
      headerActions: {
        createRoute: 'UserCreate',
        extraMoreActions: [
          {
            name: 'deactiveSelected',
            title: this.$tc('Deactive selected')
          },
          {
            name: 'activeSelected',
            title: this.$tc('Active selected')
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
