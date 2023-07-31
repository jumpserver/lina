<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Detail from './Detail.vue'
import UserJsonTab from '@/components/Apps/ManyJsonTabs/UserJsonTab.vue'
import AssetJsonTab from '@/components/Apps/ManyJsonTabs/AssetJsonTab.vue'

export default {
  components: {
    GenericDetailPage,
    Detail,
    UserJsonTab,
    AssetJsonTab
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('acl.RuleDetail'),
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
        hasRightSide: true,
        actions: {
          detailApiUrl: `/api/v1/acls/login-asset-acls/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/acls/login-asset-acls/${this.$route.params.id}/`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
