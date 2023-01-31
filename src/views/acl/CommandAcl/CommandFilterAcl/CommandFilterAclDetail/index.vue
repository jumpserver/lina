<template>
  <GenericDetailPage
    :object.sync="CommandFilterAcl"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="CommandFilterAcl" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail
  },
  data() {
    return {
      CommandFilterAcl: {},
      config: {
        url: '/api/v1/acls/command-filter-acls',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          }
        ],
        actions: {
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
