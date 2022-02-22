<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import Basic from './Base'
import TerminalList from './TerminalList'

export default {
  components: {
    TabPage,
    Basic,
    TerminalList
  },
  data() {
    return {
      loading: true,
      activeMenu: 'Basic',
      submenu: [
        {
          title: this.$t('setting.Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('route.Terminal'),
          name: 'TerminalList'
        }
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
  }
}
</script>

<style scoped>

</style>
