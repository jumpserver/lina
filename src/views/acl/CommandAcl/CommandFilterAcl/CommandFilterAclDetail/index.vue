<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="CommandFilterAcl"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="CommandFilterAcl" />
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
      CommandFilterAcl: {},
      config: {
        url: '/api/v1/acls/command-filter-acls',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          },
          {
            title: this.$t('users.Users'),
            name: 'UserJsonTab'
          },
          {
            title: this.$t('assets.Assets'),
            name: 'AssetJsonTab'
          }
        ],
        actions: {
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
