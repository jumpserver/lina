<template>
  <GenericListPage
    ref="GenericListPage"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
  />
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
    const isOwnFlow = (row) => {
      const currentOrg = vm.$store.getters.currentOrg
      return currentOrg.is_root || row.org_id === currentOrg.id
    }
    return {
      createDrawer: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
      detailDrawer: () => import('@/views/tickets/TicketFlow/Detail'),
      tableConfig: {
        url: '/api/v1/tickets/flows/',
        permissions: {
          resource: 'ticketflow'
        },
        columnsExclude: ['rules'],
        columnsShow: {
          min: ['name', 'approval_level', 'actions'],
          default: [
            'name',
            'approval_level',
            'created_by',
            'org_name',
            'date_created',
            'date_updated',
            'actions'
          ]
        },
        columnsMeta: {
          org_name: {
            formatter: function (row, col, cell) {
              const currentOrg = vm.$store.getters.currentOrg
              return currentOrg['is_root'] ? row.org_name : currentOrg.name
            }
          },
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              permissions: 'tickets.view_ticketflow',
              getRoute: ({ row }) => ({
                name: 'FlowDetail',
                params: {
                  id: row.id
                }
              }),
              getDrawerTitle: ({ row }) => {
                return row.name || row.type.label
              },
              getTitle: function ({ row }) {
                return row.name || row.type.label
              }
            }
          },
          actions: {
            prop: 'actions',
            formatterArgs: {
              hasClone: false,
              hasDelete: true,
              canDelete: ({ row }) => {
                return vm.$hasPerm('tickets.delete_ticketflow') && isOwnFlow(row)
              },
              canUpdate: () => {
                return vm.$hasPerm('tickets.change_ticketflow')
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: true,
        hasBulkDelete: true,
        createRoute: { name: 'TicketFlowCreate' },
        hasSearch: false,
        hasImport: false
      }
    }
  }
}
</script>
