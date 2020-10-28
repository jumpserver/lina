<template>
  <GenericDetailPage :object.sync="RemoteAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="RemoteAppPermission" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import RemoteAppPermissionRemoteApp from './ApplicationsPermission'
import RemoteAppPermissionDetail from './AppliactionPermissionDetail'
import RemoteAppPermissionUser from './ApplicationPermissionUser'

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
            title: this.$t('common.BasicInfo'),
            name: 'RemoteAppPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'RemoteAppPermissionUser'
          },
          {
            title: this.$t('perms.appsList'),
            name: 'RemoteAppPermissionRemoteApp'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/perms/application-permissions/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/perms/application-permissions/${this.$route.params.id}/`
        }
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
