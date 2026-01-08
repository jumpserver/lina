<template>
  <TabPage v-model:active-menu="config.activeMenu" :submenu="config.submenu">
    <template #badge>
      <el-badge
        v-if="props.tab === 'AssignedTicketList'"
        v-slot="props"
        :value="getBadgeValue(props)"
        size="small"
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
import i18n from '@/i18n/i18n'

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
            title: i18n.global.t('MyTickets'),
            name: 'MyTicketList'
          },
          {
            title: i18n.global.t('AwaitingMyApproval'),
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
