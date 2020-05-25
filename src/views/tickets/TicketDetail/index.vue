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
      return this.ticket.user_display
    }
  }
}
</script>

<style scoped>

</style>
