<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
  import { GenericDetailPage } from '@/layout/components'
  import Detail from './Detail.vue'
  export default {
    name: 'AssetListDetail',
    components: {
      GenericDetailPage,
      Detail
    },
    data() {
      return {
        TaskDetail: {},
        config: {
          title: this.$t('assets.SystemUserDetail'),
          activeMenu: 'Detail',
          submenu: [
            {
              title: this.$t('assets.detail'),
              name: 'Detail'
            }
          ],
          hasRightSide: false
        }
      }
    }
  }
</script>

<style scoped>
</style>
