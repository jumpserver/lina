<template>
  <GenericDetailPage :object.sync="KubernetesApp" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="KubernetesApp" />
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
      KubernetesApp: {
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
          deleteApiUrl: `/api/v1/applications/applications/${this.$route.params.id}/`
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
