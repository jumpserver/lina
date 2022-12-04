<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/command-groups/',
        permissions: {
          app: 'acls',
          resource: 'commandgroup'
        },
        columns: [
          'name', 'content', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'content', 'actions']
        },
        columnsMeta: {
        }
      },
      headerActions: {
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'CommandGroupCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandgroup')
        }
      }
    }
  },
  computed: {
  }
}
</script>

<style>

</style>
