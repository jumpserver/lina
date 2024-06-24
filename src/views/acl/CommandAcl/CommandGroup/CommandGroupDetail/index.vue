<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="CommandGroup"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="CommandGroup" />
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
      CommandGroup: {},
      config: {
        url: '/api/v1/acls/command-groups',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
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
