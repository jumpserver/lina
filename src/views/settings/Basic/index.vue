<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="submenu">
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
          title: this.$t('Basic'),
          name: 'Basic'
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
