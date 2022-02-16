<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <el-badge
      v-if="props.tab === 'AssignedTicketList'"
      slot="badge"
      slot-scope="props"
      :value="getBadgeValue(props)"
      size="mini"
      type="primary"
    />
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'
import { getTicketOpenCount } from '@/api/ticket'
import AssignedTicketList from './AssignedTicketList'
import MyTicketList from './MyTicketList'
import TicketFlow from './TicketFlow/TicketFlow'

export default {
  name: 'Index',
  components: {
    TabPage,
    AssignedTicketList,
    MyTicketList,
    TicketFlow
  },
  data() {
    const vm = this
    return {
      assignedTicketCount: 0,
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
          },
          {
            title: this.$t('tickets.FlowSetUp'),
            icon: 'fa-gear',
            name: 'TicketFlow',
            hidden: () => {
              return !vm.$store.getters.currentUserIsSuperAdmin
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentUser'
    ])
  },
  mounted() {
    this.getTicketOpenCount()
  },
  methods: {
    getTicketOpenCount() {
      getTicketOpenCount(this.currentUser.id).then(data => {
        this.assignedTicketCount = data.count
      })
    },
    getBadgeValue(props) {
      return this.assignedTicketCount
    }
  }
}
</script>

<style scoped>
  .primary {
    background-color: #1ab394;
  }

</style>
