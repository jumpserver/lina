<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <template #badge>
      <el-badge
        v-if="props.tab === 'AssignedTicketList'"
        v-slot="props"
        :value="getBadgeValue(props)"
        size="mini"
        type="primary"
      />
    </template>
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

export default {
  name: 'Index',
  components: {
    TabPage,
    AssignedTicketList,
    MyTicketList
  },
  data() {
    return {
      assignedTicketCount: 0,
      config: {
        activeMenu: 'MyTicketList',
        submenu: [
          {
            title: this.$t('MyTickets'),
            name: 'MyTicketList'
          },
          {
            title: this.$t('AwaitingMyApproval'),
            name: 'AssignedTicketList'
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
        this.assignedTicketCount = data['count']
      })
    },
    getBadgeValue(props) {
      return this.assignedTicketCount
    }
  }
}
</script>

<style scoped>
</style>
