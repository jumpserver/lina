<template>
  <GenericDetailPage :object.sync="app" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="app" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import DatabaseAppDetail from './DatabaseAppDetail'

export default {
  components: {
    GenericDetailPage,
    DatabaseAppDetail,
    TabPage
  },
  data() {
    return {
      app: {
        name: '', get_type_display: '', host: '', port: '', database: '', date_created: '', created_by: '', comment: '', attrs: ''
      },
      config: {
        url: '/api/v1/applications/applications/',
        activeMenu: 'DatabaseAppDetail',
        submenu: [
          {
            title: this.$t('route.DatabaseAppDetail'),
            name: 'DatabaseAppDetail'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          updateCallback: (item) => {
            this.$router.push({ name: 'DatabaseAppUpdate', params: { id: this.app.id }, query: { type: this.app.type }})
          }
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
