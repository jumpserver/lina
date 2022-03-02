<template>
  <GenericDetailPage :object.sync="app" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="app" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import ApplicationsPermission from './ApplicationsPermission'
import ApplicationPermissionDetail from './AppliactionPermissionDetail'
import ApplicationPermissionUser from './ApplicationPermissionUser'

export default {
  components: {
    ApplicationsPermission,
    ApplicationPermissionDetail,
    ApplicationPermissionUser,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      app: { type: '', category: '', id: '' },
      config: {
        activeMenu: 'ApplicationPermissionDetail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ApplicationPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'ApplicationPermissionUser',
            hidden: () => !this.$hasPerm('perms.view_applicationpermission')
          },
          {
            title: this.$t('perms.appsList'),
            name: 'ApplicationsPermission',
            hidden: () => !this.$hasPerm('perms.view_applicationpermission')
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/perms/application-permissions/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/perms/application-permissions/${this.$route.params.id}/`,
          updateCallback: () => {
            const route = {
              name: 'ApplicationPermissionUpdate',
              query: {
                type: this.app.type,
                category: this.app.category
              },
              params: {
                id: this.app.id
              }
            }
            this.$router.push(route)
          }
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
