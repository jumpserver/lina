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
        columnsMeta: {
          actions: {
          }
        }
      },
      headerActions: {
        extraMoreActions: [
          {
            name: 'deactiveSelected',
            title: this.$tc('Deactive selected'),
            callback: () => {
              console.log('deactiveSelected')
            }
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
