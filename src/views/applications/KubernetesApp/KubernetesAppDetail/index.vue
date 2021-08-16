<template>
  <GenericDetailPage :object.sync="app" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="app" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import KubernetesAppDetail from './KubernetesAppDetail'

export default {
  components: {
    GenericDetailPage,
    KubernetesAppDetail,
    TabPage
  },
  data() {
    return {
      app: {
        name: '', type_display: '', cluster: '', date_created: '', created_by: '', comment: '', attrs: ''
      },
      config: {
        activeMenu: 'KubernetesAppDetail',
        submenu: [
          {
            title: this.$t('route.KubernetesAppDetail'),
            name: 'KubernetesAppDetail'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`,
          updateCallback: (item) => {
            this.$router.push({ name: 'KubernetesAppUpdate', params: { id: this.app.id }, query: { type: this.app.type }})
          }
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
