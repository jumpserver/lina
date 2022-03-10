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
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.CommandFilterDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.CommandFilterRules'),
            name: 'rules',
            hidden: () => !this.$hasPerm('assets.view_commandfilterrule')
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped>

</style>
