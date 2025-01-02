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
  props: {
    object: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      TaskDetail: {},
      config: {
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
        hasRightSide: true,
        url: '/api/v1/acls/connect-method-acls/',
        actions: {
          detailApiUrl: `/api/v1/acls/connect-method-acls/${this.object.id}/`,
          deleteApiUrl: `/api/v1/acls/connect-method-acls/${this.object.id}/`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
