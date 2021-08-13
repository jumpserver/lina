<template>
  <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListTable } from '@/layout/components'

export default {
  name: 'TicketFlow',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/tickets/flows/',
        columns: [
          'title', 'type_display', 'created_by',
          'date_created', 'date_updated', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['title', 'actions'],
          default: [
            'title', 'type_display', 'created_by',
            'date_created', 'date_updated', 'org_name',
            'actions'
          ]
        },
        columnsMeta: {
          actions: {
            prop: 'actions',
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              onClone: ({ row }) => {
                vm.$router.push({ name: 'TemplateCreate', query: { type: row.type, clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'TicketFlowUpdate', params: { id: row.id }, query: { type: row.type }})
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style>

</style>
