<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'

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
            title: this.$t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
            name: 'AccountChangeSecretList',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation'),
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
