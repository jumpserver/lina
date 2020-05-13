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
      ticket: {},
      config: {
        activeMenu: 'TicketDetail',
        submenu: [
          {
            title: '工单详情',
            name: 'TicketDetail'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
