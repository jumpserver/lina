<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import Rules from './Rules.vue'
export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Rules
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        title: this.$t('assets.commandFilterDetail'),
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.commandFilterDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.commandFilterRules'),
            name: 'rules'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>

<style scoped>

</style>
