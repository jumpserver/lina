<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="ticket"
    :title="ticket.title"
  >
    <component :is="config.activeMenu" :object="ticket" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TicketDetail from './TicketDetail'
import TicketActivity from '../../components/TicketActivity'

export default {
  components: {
    GenericDetailPage,
    TicketDetail,
    TicketActivity,
    TabPage
  },
  data() {
    return {
      ticket: {
        title: '',
        user_display: '',
        type_display: '',
        status: '',
        assignees_display: '',
        date_created: ''
      },
      config: {
        activeMenu: 'TicketDetail',
        url: '/api/v1/tickets/tickets/',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'TicketDetail'
          },
          {
            title: this.$t('Activity'),
            name: 'TicketActivity'
          }
        ],
        hasActivity: false,
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
