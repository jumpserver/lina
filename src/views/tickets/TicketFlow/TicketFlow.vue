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
              hasDelete: false,
              canUpdate: () => {
                return vm.$hasPerm('tickets.change_ticketflow')
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: true,
        hasBulkDelete: false,
        createRoute: { name: 'TicketFlowCreate' },
        hasSearch: false,
        hasImport: false
      }
    }
  }
}
</script>
