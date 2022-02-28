<template>
  <GenericDetailPage :actions="actions" :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
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
      TaskDetail: {},
      actions: {
      },
      config: {
        title: this.$t('assets.PlatformDetail'),
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          }
        ],
        hasRightSide: this.$route.params.id > 7
      }
    }
  },
  computed: {
    hasRightSide() {
      return this.$route.params.id > 7
    }
  }
}
</script>

<style scoped>

</style>
