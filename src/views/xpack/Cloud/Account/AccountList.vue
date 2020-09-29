<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { BooleanFormatter, DetailFormatter } from '@/components/ListTable/formatters'

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
            prop: 'name',
            sortable: true,
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountDetail'
            }
          },
          provider: {
            width: '120px'
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountUpdate'
            }
          },
          validity: {
            width: '90px',
            align: 'center',
            formatter: BooleanFormatter,
            formatterArgs: {
              iconChoices: {
                false: 'fa-times text-danger',
                true: 'fa-check text-primary'
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
