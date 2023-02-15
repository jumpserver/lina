<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="LogDetail"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="LogDetail" />
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
      LogDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          }
        ],
        actions: {
          hasUpdate: () => false,
          hasDelete: () => false
        },
        hasActivity: false,
        getObjectName: (obj) => { return obj.id }
      }
    }
  }
}
</script>

<style scoped>

</style>
