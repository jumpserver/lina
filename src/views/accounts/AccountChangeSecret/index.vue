<template>
  <TabPage v-model:active-menu="config.activeMenu" :disabled="!hasValidLicense" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'
import store from '@/store'

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
          },
          {
            title: this.$t('ChangeSecretStatus'),
            name: 'ChangeSecretStatus',
            hidden: () => !this.$hasPerm('accounts.view_changesecretexecution') || !this.ChangeSecretAfterSessionEnd,
            component: () => import('@/views/accounts/AccountChangeSecret/AccountList.vue')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['hasValidLicense']),
    ChangeSecretAfterSessionEnd() {
      return store.getters.publicSettings?.CHANGE_SECRET_AFTER_SESSION_END
    }
  },
  mounted() {
    this.$eventBus.$on('change-tab', this.handleChangeTab)
  },
  beforeDestroy() {
    this.$eventBus.$off('change-tab', this.handleChangeTab)
  },
  methods: {
    handleChangeTab({ name, payload }) {
      this.config.activeMenu = name
      Object.assign(this.$route.params, { ...payload })
    }
  }
}
</script>
