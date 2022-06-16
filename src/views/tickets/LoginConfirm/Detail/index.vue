<template>
  <GenericDetailPage :object.sync="ticket" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
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
        url: '',
        submenu: [
          {
            title: this.$t('route.TicketDetail'),
            name: 'TicketDetail'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/tickets/apply-login-tickets/${this.$route.params.id}/`
        },
        getObjectName: this.getObjectName,
        hasRightSide: false
      }
    }
  },
  mounted() {

  },
  methods: {
    getObjectName() {
      return this.ticket.title
    }
  }
}
</script>

<style scoped>

</style>
