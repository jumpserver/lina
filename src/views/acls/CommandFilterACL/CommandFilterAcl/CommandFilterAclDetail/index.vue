<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="CommandFilterACL"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="CommandFilterACL" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import UserJsonTab from '@/components/Apps/ManyJsonTabs/UserJsonTab.vue'
import AssetJsonTab from '@/components/Apps/ManyJsonTabs/AssetJsonTab.vue'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    UserJsonTab,
    AssetJsonTab
  },
  data() {
    return {
      CommandFilterACL: {},
      config: {
        url: '/api/v1/acls/command-filter-acls',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('MenuUsers'),
            name: 'UserJsonTab'
          },
          {
            title: this.$t('Assets'),
            name: 'AssetJsonTab'
          }
        ],
        actions: {}
      }
    }
  }
}
</script>

<style scoped>

</style>
