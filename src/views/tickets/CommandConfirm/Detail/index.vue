<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="ticket" :title="ticket.title" v-bind="config" v-on="$listeners">
    <component :is="config.activeMenu" :object="ticket" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TicketDetail from './TicketDetail'

export default {
  components: {
    GenericDetailPage,
    TicketDetail,
    TabPage
  },
  data() {
    return {
      ticket: { title: '', user_display: '', type_display: '', status: '', assignees_display: '', date_created: '' },
      config: {
        activeMenu: 'TicketDetail',
        url: '/api/v1/tickets/apply-command-tickets/',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'TicketDetail'
          }
        ],
        hasRightSide: false
      }
    }
  },
  methods: {
    getObjectName() {
      return this.ticket.title
    }
  }
}
</script>
