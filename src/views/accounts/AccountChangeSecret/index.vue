<template>
  <TabPage :active-menu.sync="config.activeMenu" :disabled="!hasValidLicense" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountChangeSecretList',
        submenu: [
          {
            title: this.$t('Overview'),
            name: 'AccountChangeDashboard',
            component: () => import('./Overview/index.vue')
          },
          {
            title: this.$tc('ChangeSecretTask', 2),
            name: 'AccountChangeSecretList',
            hidden: () => !this.$hasPerm('accounts.view_changesecretautomation'),
            component: () => import('./AccountChangeSecretList.vue')
          },
          {
            title: this.$t('ExecutionHistory'),
            name: 'AccountChangeSecretExecutionList',
            hidden: () => !this.$hasPerm('accounts.view_changesecretexecution'),
            component: () => import('@/views/accounts/AccountChangeSecret/Executions/AccountChangeSecretExecutionList.vue')
          },
          {
            title: this.$t('ExecutionRecord'),
            name: 'ChangeSecretRecord',
            hidden: () => !this.$hasPerm('accounts.view_changesecretrecord'),
            component: () => import('@/views/accounts/AccountChangeSecret/ExecutionDetail/AccountChangeSecretRecord.vue')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['hasValidLicense'])
  },
  mounted() {
    this.$eventBus.$on('change-tab', this.handleChangeTab)
  },
  beforeDestroy() {
    this.$eventBus.$off('change-tab', this.handleChangeTab)
  },
  methods: {
    handleChangeTab(tab) {
      this.config.activeMenu = tab
    }
  }
}
</script>
