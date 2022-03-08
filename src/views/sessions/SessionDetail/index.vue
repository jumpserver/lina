<template>
  <GenericDetailPage
    :url="url"
    :submenu="submenu"
    :object.sync="sessionData"
    :active-menu.sync="activeSubMenu"
    :has-right-side="false"
    :get-object-name="getSessionName"
  >
    <keep-alive>
      <component :is="activeSubMenu" :object="sessionData" />
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
      url: `/api/v1/terminal/sessions`,
      activeSubMenu: 'SessionDetailInfo',
      submenu: [
        {
          title: this.$t('route.Detail'),
          name: 'SessionDetailInfo'
        },
        {
          title: this.$t('sessions.command'),
          name: 'SessionCommands',
          hidden: () => !this.$hasPerm('terminal.view_command')
        },
        {
          title: this.$t('sessions.Activity'),
          name: 'SessionJoinRecords',
          hidden: () => !this.$hasPerm('terminal.view_sessionjoinrecord')
        }
      ]
    }
  },
  methods: {
    getSessionName() {
      return this.sessionData.id
    }
  }
}
</script>

<style scoped>

</style>
