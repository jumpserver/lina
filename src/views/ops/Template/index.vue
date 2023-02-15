<template>
  <TabPage
    :submenu="submenu"
    :active-menu.sync="activeMenu"
  >
    <component :is="activeMenu" />
  </TabPage>

</template>

<script>
import { TabPage } from '@/layout/components'
import Adhoc from '@/views/ops/Template/Adhoc'
import Playbook from '@/views/ops/Template/Playbook'

export default {
  name: 'Index',
  components: {
    TabPage,
    Adhoc,
    Playbook
  },
  data() {
    return {
      activeMenu: 'Adhoc',
      submenu: [
        {
          title: this.$t('ops.AdhocManage'),
          name: 'Adhoc',
          hidden: () => !this.$hasPerm('ops.view_adhoc')
        },
        {
          title: this.$t('ops.PlaybookManage'),
          name: 'Playbook',
          hidden: () => !this.$hasPerm('ops.view_playbook')
        }
      ]
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
