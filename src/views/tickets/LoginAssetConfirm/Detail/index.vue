<template>
  <GenericDetailPage
    v-bind="config"
    class="ticket-detail-page"
    v-model:active-menu="config.activeMenu"
    v-model:object="ticket"
    :title="ticket.title || $t('TicketDetail')"
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
        url: '',
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
        actions: {
          detailApiUrl: `/api/v1/tickets/tickets/${this.$context.get('id')}/`
        },
        getObjectName: this.getObjectName,
        hasActivity: false,
        hasRightSide: false
      }
    }
  },
  mounted() {},
  methods: {
    getObjectName() {
      return this.ticket.title
    }
  }
}
</script>

<style scoped src="@/views/tickets/ticket-detail.css"></style>
