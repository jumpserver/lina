<template>
  <div>
    <ListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { DateFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'SSHKeyList',
  components: {
    ListTable
  },
  data() {
    return {
      headerActions: {
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasCreate: true
      },
      tableConfig: {
        hasSelection: true,
        url: '/api/v1/authentication/ssh-key/',
        columns: ['id', 'name', 'comment', 'is_active', 'date_created', 'date_last_used'],
        columnsShow: {
          min: ['id', 'name']
        },
        columnsMeta: {
          name: {
            formatter: function(row) {
              return row.name || '-'
            }
          },
          id: {
            label: 'ID'
          },
          date_created: {
            label: this.$t('DateCreated'),
            formatter: DateFormatter
          }
        }
      }
    }
  },
  methods: {}
}
</script>
