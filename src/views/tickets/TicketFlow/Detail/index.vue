<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="ticket"
  >
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
      ticket: {
        user_display: '',
        type_display: '',
        status: '',
        assignees_display: '',
        date_created: ''
      },
      config: {
        activeMenu: 'TicketDetail',
        url: '/api/v1/tickets/flows',
        submenu: [
          {
            title: this.$t('TicketDetail'),
            name: 'TicketDetail'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>
