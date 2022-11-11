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
import PlaybookList from '@/views/ops/Playbook/PlaybookList'
import History from '@/views/ops/Playbook/HIstory'

export default {
  name: 'Index',
  components: {
    TabPage,
    PlaybookList,
    History
  },
  data() {
    return {
      activeMenu: 'PlaybookList',
      submenu: [
        {
          title: 'Playbook',
          name: 'PlaybookList'
        },
        {
          title: this.$t('ops.history'),
          name: 'History'
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
