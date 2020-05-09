<template>
  <GenericDetailPage :object.sync="RemoteAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <component :is="config.activeMenu" :object="RemoteAppPermission" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import RemoteAppPermissionRemoteApp from './RemoteAppPermissionRemoteApp'
import RemoteAppPermissionDetail from './RemoteAppPermissionDetail'
import RemoteAppPermissionUser from './RemoteAppPermissionUser'

export default {
  components: {
    RemoteAppPermissionRemoteApp,
    RemoteAppPermissionDetail,
    RemoteAppPermissionUser,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      RemoteAppPermission: {},
      config: {
        activeMenu: 'RemoteAppPermissionDetail',
        submenu: [
          {
            title: this.$t('perms.RemoteAppPermissionDetail'),
            name: 'RemoteAppPermissionDetail'
          },
          {
            title: this.$t('perms.UsersAndUserGroups'),
            name: 'RemoteAppPermissionUser'
          },
          {
            title: this.$t('perms.RemoteApp'),
            name: 'RemoteAppPermissionRemoteApp'
          }
        ]
      }
    }
  },
  methods: {
    TabClick(tab) {
      if (tab.name !== 'RemoteAppPermissionDetail') {
        this.$set(this.config, 'hasRightSide', false)
      } else {
        this.$set(this.config, 'hasRightSide', true)
      }
    }
  }
}
</script>

<style scoped>

</style>
