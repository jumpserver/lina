<template>
  <GenericDetailPage
    :object.sync="ticket"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    @getObjectDone="afterGetTicket"
    v-on="$listeners"
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
        title: '',
        user_display: '',
        status: '',
        assignees_display: '',
        date_created: ''
      },
      config: {
        activeMenu: 'TicketDetail',
        submenu: [
          {
            title: this.$t('route.TicketDetail'),
            name: 'TicketDetail'
          }
        ],
        getObjectName: this.getObjectName,
        hasRightSide: false
      }
    }
  },
  methods: {
    getObjectName() {
      return this.ticket.title
    },
    afterGetTicket(ticket) {
      const ticketRouteMapper = {
        'apply_asset': 'AssetsTicketDetail',
        'login_confirm': 'LoginTicketDetail',
        'login_asset_confirm': 'LoginAssetTicketDetail',
        'command_confirm': 'CommandConfirmDetail'
      }
      const routeName = ticketRouteMapper[ticket.type.value]
      setTimeout(() => {
        this.$router.push({
          name: routeName,
          params: { id: this.$route.params['id'] }
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
