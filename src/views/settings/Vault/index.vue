<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import Base from './Base'
import Vault from './Vault'

export default {
  components: {
    TabPage,
    Base,
    Vault
  },
  data() {
    return {
      loading: true,
      activeMenu: 'Vault',
      submenu: [
        {
          title: this.$t('setting.Vault'),
          name: 'Vault'
        }
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
  },
  mounted() {
  },
  methods: {}
}
</script>

<style scoped>

</style>
