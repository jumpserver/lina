<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="sessionData"
    v-bind="config"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="sessionData" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import SessionCommands from './SessionCommands'
import SessionDetailInfo from './SessionDetailInfo'
import SessionJoinRecords from './SessionJoinRecords'

export default {
  name: 'SessionDetail',
  components: {
    GenericDetailPage,
    SessionCommands,
    SessionDetailInfo,
    SessionJoinRecords
  },
  data() {
    return {
      sessionData: {},
      config: {
        url: `/api/v1/terminal/sessions`,
        activeMenu: 'SessionDetailInfo',
        submenu: [
          {
            title: this.$t('Detail'),
            name: 'SessionDetailInfo'
          },
          {
            title: this.$t('Command'),
            name: 'SessionCommands',
            hidden: () => !this.$hasPerm('terminal.view_command')
          },
          {
            title: this.$t('Activity'),
            name: 'SessionJoinRecords',
            hidden: () => !this.$hasPerm('terminal.view_sessionjoinrecord')
          }
        ],
        getObjectName: (obj) => { return obj.id },
        hasActivity: false,
        hasRightSide: false
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
