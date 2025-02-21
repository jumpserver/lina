<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountBackupInfo from './AccountBackupInfo.vue'

export default {
  name: 'AccountBackupDetail',
  components: {
    GenericDetailPage,
    AccountBackupInfo
  },
  data() {
    return {
      plan: { name: '', comment: '' },
      config: {
        url: `/api/v1/accounts/account-backup-plans`,
        activeMenu: 'AccountBackupInfo',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountBackupInfo'
          }
        ]
      }
    }
  }
}
</script>
