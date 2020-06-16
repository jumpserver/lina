<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/accounts/',
        columns: [
          'name', 'provider', 'validity', 'date_created', 'comment', 'actions'
        ],
        columnsMeta: {
          name: {
            formatter: null
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountUpdate'
            }
          },
          validity: {
            formatter: (row, col, cellValue) => {
              const display = row.validity_display
              if (cellValue) {
                return display
              } else {
                return <span class='text-danger'>{ display }</span>
              }
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        createRoute: 'AccountCreate'
      }
    }
  }
}
</script>

<style>

</style>
