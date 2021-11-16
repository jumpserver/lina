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
        url: '/api/v1/rbac/roles/?scope=system',
        columns: [
          'name', 'builtin', 'created_by', 'date_create',
          'date_updated', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name', 'builtin', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              permissions: ['rbac.view_role']
            }
          }
        }
      },
      headerActions: {
      }
    }
  }
}
</script>

<style>

</style>
