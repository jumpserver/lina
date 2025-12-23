<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :submenu="submenu"
  >
    <component :is="activeMenu" />
  </TabPage>
</template>

<script>
import Adhoc from './components/Adhoc.vue'
import Playbook from './components/PlayBook.vue'
import TabPage from '@/layout/components/TabPage/index.vue'

export default {
  components: {
    Adhoc,
    TabPage,
    Playbook
  },
  data() {
    return {
      activeMenu: 'Adhoc',
      submenu: [
        {
          title: this.$t('AdhocManage'),
          name: 'Adhoc',
          hidden: () => !this.$hasPerm('ops.view_adhoc')
        },
        {
          title: this.$t('PlaybookManage'),
          name: 'Playbook',
          hidden: () => !this.$hasPerm('ops.view_playbook')
        }
      ]
    }
  }
}
</script>
