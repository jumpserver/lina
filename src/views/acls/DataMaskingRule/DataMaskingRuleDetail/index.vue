<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="instance"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="instance" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import AssetJsonTab from '@/components/Apps/ManyJsonTabs/AssetJsonTab.vue'
import UserJsonTab from '@/components/Apps/ManyJsonTabs/UserJsonTab.vue'
import { GenericDetailPage } from '@/layout/components'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    Detail,
    UserJsonTab,
    AssetJsonTab
  },
  data() {
    return {
      instance: {},
      config: {
        url: `/api/v1/acls/data-masking-rules/`,
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
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped></style>
