<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Announcement from './Announcement.vue'
import Basic from './Basic.vue'
import Vault from './Vault.vue'

export default {
  name: 'Feature',
  components: { TabPage, Basic, Announcement, Vault },
  data() {
    return {
      activeMenu: 'Basic',
      submenu: [
        {
          title: this.$t('common.Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('setting.Announcement'),
          name: 'Announcement'
        },
        {
          title: this.$t('setting.Vault'),
          name: 'Vault',
          hidden: !this.$hasPerm('settings.change_vault')
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
