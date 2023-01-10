<template>
  <GenericDetailPage
    :object.sync="TaskDetail"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import AssetActivity from './Activity.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AssetActivity
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          },
          {
            title: this.$t('common.Activity'),
            name: 'AssetActivity',
            hidden: () => !this.$hasPerm('audits.view_operatelog')
          }
        ],
        actions: {
          hasUpdate: () => false
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
