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
        activeMenu: 'all',
        submenu: [
          {
            title: this.$t('assets.All'),
            name: 'all',
            component: () => import('@/views/assets/Asset/AssetList/AllList.vue')
          },
          {
            title: this.$t('applications.host'),
            name: 'host',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/HostList.vue')
          },
          {
            title: this.$t('route.NetworkDevices'),
            name: 'networking',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/NetworkList.vue')
          },
          {
            title: this.$t('route.Databases'),
            name: 'database',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/DatabaseList.vue')
          },
          {
            title: this.$t('assets.CloudPlatform'),
            name: 'cloud',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/CloudsPlatformList.vue')
          },
          {
            title: 'Web',
            name: 'web',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/WebList.vue')
          }
        ]
      }
    }
  },
  computed: {
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
