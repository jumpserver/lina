<template>
  <GenericDetailPage
    v-bind="config"
    class="ticket-detail-page"
    v-model:active-menu="config.activeMenu"
    v-model:object="ticket"
    :title="ticket.title || $t('TicketDetail')"
    @get-object-done="afterGetTicket"
  >
    <template #headingRightSide>
      <TicketReapplyButton :ticket="ticket" />
    </template>
    <component :is="config.activeMenu" :object="ticket" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TicketDetail from './TicketDetail'
import { getTicketDetailRoute } from '../plugins/registry'
import TicketActivity from '../components/TicketActivity'
import TicketReapplyButton from '../components/TicketReapplyButton.vue'

export default {
  components: {
    TicketReapplyButton,
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
        status: '',
        assignees_display: '',
        date_created: ''
      },
      config: {
        actions: { detailApiUrl: `/api/v1/tickets/tickets/${this.$context.get('id')}/` },
        activeMenu: 'TicketDetail',
        submenu: [
          {
            title: this.$t('TicketDetail'),
            name: 'TicketDetail'
          },
          {
            title: this.$t('Activity'),
            name: 'TicketActivity'
          }
        ],
        getObjectName: this.getObjectName,
        hasActivity: false,
        hasRightSide: false
      }
    }
  },
  methods: {
    getObjectName() {
      return this.ticket.title
    },
    afterGetTicket(ticket) {
      const routeName = getTicketDetailRoute(ticket.type.value)
      if (routeName === 'TicketDetail') return
      setTimeout(() => {
        this.$router.push({
          name: routeName,
          params: { id: this.$context.get('id') }
        })
      })
    }
  }
}
</script>

<style scoped src="@/views/tickets/ticket-detail.css"></style>
