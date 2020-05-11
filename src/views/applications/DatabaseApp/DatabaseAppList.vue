<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/applications/database-apps/',
        columns: [
          'name', 'type', 'host', 'port', 'database', 'comment',
          {
            prop: 'id',
            label: this.$ttc('action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/applications/database-apps/${id}/`
                return this.$axios.delete(url)
              },
              updateRoute: 'DatabaseAppUpdate'
            }
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'DatabaseAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
