<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { GenericListTable } from '@/layout/components'

export default {
  name: 'AccountPushList',
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/account-check-engines/',
        columns: [
          'name', 'comment'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter
          }
        },
        actions: {
          formatterArgs: {}
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
