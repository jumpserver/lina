<template>
  <TabPage
    v-if="!loading"
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
      loading: true,
      config: {
        activeMenu: 'all',
        submenu: [
          {
            name: 'all',
            title: this.$t('assets.All'),
            icon: 'fa-bars',
            component: () => import('@/views/assets/Asset/AssetList/AllList.vue')
          },
          {
            icon: 'fa-inbox',
            name: 'host',
            component: () => import('@/views/assets/Asset/AssetList/HostList.vue'),
            hidden: true
          },
          {
            name: 'device',
            icon: 'fa-microchip',
            hidden: true,
            component: () => import('@/views/assets/Asset/AssetList/DeviceList.vue')
          },
          {
            icon: 'fa-database',
            name: 'database',
            component: () => import('@/views/assets/Asset/AssetList/DatabaseList.vue')
          },
          {
            icon: 'fa-cloud',
            name: 'cloud',
            hidden: true,
            component: () => import('@/views/assets/Asset/AssetList/CloudList.vue')
          },
          {
            icon: 'fa-globe',
            name: 'web',
            hidden: true,
            component: () => import('@/views/assets/Asset/AssetList/WebList.vue')
          },
          {
            icon: 'fa-comment',
            name: 'gpt',
            hidden: true,
            component: () => import('@/views/assets/Asset/AssetList/GPTList.vue')
          },
          {
            icon: 'fa-th',
            name: 'custom',
            hidden: true,
            component: () => import('@/views/assets/Asset/AssetList/CustomList.vue')
          }
        ]
      }
    }
  },
  mounted() {
    const nameComponentMap = {}
    for (const item of this.config.submenu) {
      nameComponentMap[item.name] = item
    }
    this.$axios.get('/api/v1/assets/categories/').then(categories => {
      for (const item of categories) {
        const name = item.value
        // 如果报错，需要在上面的 submenu 中添加对应的组件
        nameComponentMap[name]['hidden'] = false
        nameComponentMap[name]['title'] = item.label
      }
      this.loading = false
    })
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
