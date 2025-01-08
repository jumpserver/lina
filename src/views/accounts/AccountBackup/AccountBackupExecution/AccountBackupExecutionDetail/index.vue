<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountBackupExecutionInfo from './AccountBackupExecutionInfo.vue'

export default {
  name: 'AccountBackupExecutionDetail',
  components: {
    GenericDetailPage,
    AccountBackupExecutionInfo
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/accounts/account-backup-plan-executions',
        activeMenu: 'AccountBackupExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountBackupExecutionInfo'
          }
        ],
        getTitle: this.getExecutionTitle

      }
    }
  },
  methods: {
    getExecutionTitle() {
      return `${this.$route.meta.title}: ${this.execution.id}`
    }
  }
}
</script>

<style scoped>

</style>
