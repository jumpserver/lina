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
import Vault from './Vault.vue'
import Ticket from './Ticket.vue'
import Ops from './Ops.vue'

export default {
  name: 'Feature',
  components: { TabPage, Announcement, Vault, Ticket, Ops },
  data() {
    return {
      activeMenu: 'Announcement',
      submenu: [
        {
          title: this.$t('setting.Announcement'),
          name: 'Announcement'
        },
        {
          title: this.$t('setting.Ticket'),
          name: 'Ticket',
          hidden: !this.$store.getters.hasValidLicense
        },
        {
          title: this.$t('setting.AppOps'),
          name: 'Ops'
        },
        {
          title: this.$t('setting.AccountStorage'),
          name: 'Vault',
          hidden: !this.$hasPerm('settings.change_vault') || !this.$store.getters.hasValidLicense
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
