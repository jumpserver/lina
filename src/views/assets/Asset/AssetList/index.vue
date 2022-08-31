<template>
  <TabPage
    :active-menu.sync="config.activeMenu"
    :submenu="config.submenu"
    @tab-click="handleTabClick"
  />
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
            name: 'hosts',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/HostList.vue')
          },
          {
            title: this.$t('route.NetworkDevices'),
            name: 'networks',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/NetworkList.vue')
          },
          {
            title: this.$t('route.Databases'),
            name: 'databases',
            hidden: () => false,
            component: () => import('@/views/assets/Asset/AssetList/DatabaseList.vue')
          },
          {
            title: this.$t('assets.CloudPlatform'),
            name: 'clouds',
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
  mounted() {
  },
  methods: {
    handleTabClick(tab) {
      const query = _.cloneDeep(this.$route.query)
      const newQuery = {
        ...query,
        activeTab: tab.name
      }
      this.$nextTick(() => {
        this.$router.replace({ query: newQuery })
      })
    }
  }
}
</script>

<style scoped>

</style>
