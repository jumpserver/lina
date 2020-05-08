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
          'name', 'username', 'groups_display', 'role', 'source', 'is_valid', 'actions'
        ],
        columnsMeta: {
          source: {
            width: '100px'
          },
          role: {
            width: '100px'
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          }
        }
      },
      headerActions: {
        extraMoreActions: [
          {
            name: 'deactiveSelected',
            title: this.$tco('Deactive selected'),
            callback: () => {
              console.log('deactiveSelected')
            }
          },
          {
            name: 'activeSelected',
            title: this.$tco('Active selected')
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
