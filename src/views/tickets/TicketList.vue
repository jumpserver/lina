<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import AssignedTicketList from './AssignedTicketList'
import MyTicketList from './MyTicketList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AssignedTicketList,
    MyTicketList
  },
  data() {
    return {
      config: {
        activeMenu: 'MyTicketList',
        submenu: [
          {
            title: this.$t('tickets.MyTickets'),
            name: 'MyTicketList'
          },
          {
            title: this.$t('tickets.AssignedMe'),
            name: 'AssignedTicketList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
