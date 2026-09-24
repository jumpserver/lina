<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>
<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { getTicketTypeLabel } from '../const'
export default {
  components: { GenericListPage },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/tickets/workflows/',
        permissions: { resource: 'workflow' },
        columns: ['name', 'type', 'active_version_number', 'enabled', 'date_updated'],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: false,
              getRoute: ({ row }) => ({ name: 'WorkflowDetail', params: { id: row.id } })
            }
          },
          type: {
            formatter: (row) =>
              getTicketTypeLabel({ value: row.type, label: row.type_label }, this.$t)
          },
          active_version_number: { label: this.$t('WFVersion') },
          enabled: { label: this.$t('Enabled') }
        }
      },
      headerActions: {
        hasCreate: true,
        canCreate: this.$hasPerm('tickets.add_workflow'),
        hasImport: false,
        hasBulkDelete: false,
        hasMoreActions: false,
        createRoute: { name: 'WorkflowCreate' },
        onCreate: () => this.$router.push({ name: 'WorkflowCreate' })
      }
    }
  }
}
</script>
