<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="sessionData"
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
import SessionFTPLogs from './SessionFTPLogs'
import SessionJoinRecords from './SessionJoinRecords'

export default {
  name: 'SessionDetail',
  components: {
    GenericDetailPage,
    SessionCommands,
    SessionDetailInfo,
    SessionJoinRecords,
    SessionFTPLogs
  },
  data() {
    return {
      sessionData: {},
      config: {
        url: `/api/v1/terminal/sessions`,
        activeMenu: 'SessionDetailInfo',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'SessionDetailInfo'
          },
          {
            title: this.$t('Command'),
            name: 'SessionCommands',
            hidden: () => !this.$hasPerm('terminal.view_command')
          },
          {
            title: this.$t('SessionJoinRecords'),
            name: 'SessionJoinRecords',
            hidden: () => !this.$hasPerm('terminal.view_sessionjoinrecord')
          },
          {
            title: this.$t('FileTransfer'),
            name: 'SessionFTPLogs',
            hidden: () => !this.$hasPerm('audits.view_ftplog')
          }
        ],
        getObjectName: (obj) => {
          return obj.id
        },
        hasActivity: true,
        hasRightSide: false
      }
    }
  },
  methods: {}
}
</script>
