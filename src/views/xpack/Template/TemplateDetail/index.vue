<template>
  <GenericDetailPage :object.sync="DatabaseApp" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="DatabaseApp" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TemplateDetail from './TemplateDetail'

export default {
  components: {
    GenericDetailPage,
    TemplateDetail,
    TabPage
  },
  data() {
    return {
      DatabaseApp: {
        name: '', get_type_display: '', host: '', port: '', database: '', date_created: '', created_by: '', comment: '', attrs: ''
      },
      config: {
        activeMenu: 'TemplateDetail',
        submenu: [
          {
            title: this.$t('route.TemplateDetail'),
            name: 'TemplateDetail'
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
