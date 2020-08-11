<template>
  <GenericDetailPage :object.sync="KubernetesAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="KubernetesAppPermission" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import KubernetesAppPermissionDetail from './KubernetesAppPermissionDetail'
import KubernetesAppPermissionUser from './KubernetesAppPermissionUser'
import KubernetesAppPermissionKubernetesApp from './KubernetesAppPermissionKubernetesApp'

export default {
  components: {
    KubernetesAppPermissionKubernetesApp,
    KubernetesAppPermissionDetail,
    KubernetesAppPermissionUser,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      KubernetesAppPermission: {},
      config: {
        activeMenu: 'KubernetesAppPermissionDetail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'KubernetesAppPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'KubernetesAppPermissionUser'
          },
          {
            title: this.$t('perms.KubernetesApp'),
            name: 'KubernetesAppPermissionKubernetesApp'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/perms/k8s-app-permissions/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/perms/k8s-app-permissions/${this.$route.params.id}/`
        }
      }
    }
  },
  methods: {
    TabClick(tab) {
      if (tab.name !== 'KubernetesAppPermissionDetail') {
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
