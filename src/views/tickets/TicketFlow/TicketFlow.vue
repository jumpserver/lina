<template>
  <GenericListPage ref="GenericListPage" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'TicketFlow',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/tickets/flows/',
        columnsExclude: ['rules'],
        columnsShow: {
          min: ['type', 'actions'],
          default: [
            'type', 'created_by', 'org_name',
            'date_created', 'date_updated', 'actions'
          ]
        },
        columnsMeta: {
          org_name: {
            formatter: function(row, col, cell) {
              const currentOrg = vm.$store.getters.currentOrg
              return currentOrg['is_root'] ? row.org_name : currentOrg.name
            }
          },
          type: {
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: 'tickets.view_ticketflow',
              route: 'FlowDetail',
              getTitle: function({ row }) {
                return row.type.label
              }
            }
          },
          actions: {
            prop: 'actions',
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              onClone: ({ row }) => {
                vm.$router.push({ name: 'TicketFlowUpdate', query: { type: row.type, clone_from: row.id }})
              },
              canUpdate: () => {
                return vm.$hasPerm('tickets.change_ticketflow')
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'TicketFlowUpdate', params: { id: row.id }})
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasSearch: false
      }
    }
  }
}
</script>

<style>

</style>
