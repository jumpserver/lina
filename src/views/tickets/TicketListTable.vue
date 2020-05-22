<template>
  <ListTable :table-config="ticketTableConfig" :header-actions="ticketActions" />
</template>
<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'TicketListTable',
  components: {
    ListTable
  },
  props: {
    url: {
      type: String,
      default: '/api/v1/tickets/tickets/'
    }
  },
  data() {
    return {
      ticketTableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'title',
            label: this.$t('tickets.title'),
            formatter: DetailFormatter,
            sortable: 'custom',
            route: 'TicketDetail'
          },
          {
            prop: 'user_display',
            label: this.$t('tickets.user'),
            sortable: 'custom'
          },
          {
            prop: 'type_display',
            label: this.$t('tickets.type'),
            sortable: 'custom'
          },
          {
            prop: 'status',
            label: this.$t('tickets.status'),
            sortable: 'custom'
          },
          {
            prop: 'date_created',
            label: this.$t('tickets.date'),
            sortable: 'custom'
          }
        ]
      },
      ticketActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
