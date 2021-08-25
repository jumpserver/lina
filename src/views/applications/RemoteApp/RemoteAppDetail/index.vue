<template>
  <GenericDetailPage :object.sync="app" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="app" />
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
      app: {
        name: '', asset: '', get_type_display: '', path: '', date_created: '', created_by: '', comment: '', attrs: ''
      },
      config: {
        activeMenu: 'RemoteAppDetail',
        submenu: [
          {
            title: this.$t('route.RemoteAppDetail'),
            name: 'RemoteAppDetail'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          updateCallback: (item) => {
            this.$router.push({ name: 'RemoteAppUpdate', params: { id: this.app.id }, query: { type: this.app.type }})
          }
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
