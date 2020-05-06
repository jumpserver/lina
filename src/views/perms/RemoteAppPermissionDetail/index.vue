<template>
  <GenericDetailPage :object.sync="RemoteAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="RemoteAppPermission" />
    </keep-alive>
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
      },
      activeConfig: {
        icon: 'fa-info',
        title: this.$t('perms.QuickModify'),
        content: [
          {
            name: this.$t('perms.Active'),
            is_active: true
          }
        ],
        url: `/api/v1/perms/remote-app-permissions/${this.$route.params.id}/`
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
