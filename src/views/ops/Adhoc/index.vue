<template>
  <TabPage
    :submenu="submenu"
    :active-menu.sync="activeMenu"
  >
    <component :is="activeMenu" :query="{type:'adhoc'}" />
  </TabPage>

</template>

<script>
import { TabPage } from '@/layout/components'
import MyAdhoc from '@/views/ops/Adhoc/MyAdhoc'
import InstantAdhoc from '@/views/ops/Adhoc/InstantAdhoc'
import JobHistory from '@/views/ops/Job/JobDetail/JobHistory'

export default {
  name: 'Index',
  components: {
    TabPage,
    MyAdhoc,
    InstantAdhoc,
    JobHistory
  },
  data() {
    return {
      activeMenu: 'MyAdhoc',
      submenu: [
        {
          title: this.$t('ops.instantAdhoc'),
          name: 'InstantAdhoc'
        },
        {
          title: this.$t('ops.myAdhoc'),
          name: 'MyAdhoc'
        },
        {
          title: this.$t('ops.history'),
          name: 'JobHistory'
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
