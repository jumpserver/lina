<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Basic from './Common.vue'

export default {
  name: 'Index',
  components: { TabPage, Basic },
  data() {
    return {
      activeMenu: 'Basic',
      submenu: [
        {
          title: this.$t('common.Basic'),
          name: 'Basic'
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
