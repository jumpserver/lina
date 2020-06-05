<template>
  <GenericDetailPage :object.sync="Organization" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="Organization" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import OrganizationDetail from './OrganizationDetail'

export default {
  components: {
    GenericDetailPage,
    OrganizationDetail,
    TabPage
  },
  data() {
    return {
      Organization: {},
      config: {
        activeMenu: 'OrganizationDetail',
        submenu: [
          {
            title: this.$t('xpack.Organization.OrganizationDetail'),
            name: 'OrganizationDetail'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
