<template>
  <GenericDetailPage :object.sync="RemoteAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="RemoteAppPermission" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import ApplicationPermissionRemoteApp from './ApplicationsPermission'
import ApplicationPermissionDetail from './AppliactionPermissionDetail'
import ApplicationPermissionUser from './ApplicationPermissionUser'

export default {
  components: {
    ApplicationPermissionRemoteApp,
    ApplicationPermissionDetail,
    ApplicationPermissionUser,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      RemoteAppPermission: {},
      config: {
        activeMenu: 'ApplicationPermissionDetail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ApplicationPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'ApplicationPermissionUser'
          },
          {
            title: this.$t('perms.appsList'),
            name: 'ApplicationPermissionRemoteApp'
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
      if (tab.name !== 'ApplicationPermissionDetail') {
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
