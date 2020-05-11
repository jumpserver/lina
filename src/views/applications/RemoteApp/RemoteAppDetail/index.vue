<template>
  <GenericDetailPage :object.sync="RemoteApp" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="RemoteApp" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import RemoteAppDetail from './RemoteAppDetail'

export default {
  components: {
    GenericDetailPage,
    RemoteAppDetail,
    TabPage
  },
  data() {
    return {
      RemoteApp: {
        name: '', asset: '', get_type_display: '', path: '', date_created: '', created_by: '', comment: ''
      },
      config: {
        activeMenu: 'RemoteAppDetail',
        submenu: [
          {
            title: this.$t('route.RemoteAppDetail'),
            name: 'RemoteAppDetail'
          }
        ]
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
