<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import detail from './detail'
import HistoryList from './HistoryList'
import AssetList from './AssetList'
export default {
  name: 'SyncInstanceTaskDetail',
  components: {
    GenericDetailPage,
    TabPage,
    detail,
    HistoryList,
    AssetList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('xpack.Cloud.SyncInstanceTaskDetail'),
            name: 'detail',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancedetail')
          },
          {
            title: this.$t('xpack.Cloud.SyncInstanceTaskHistoryList'),
            name: 'HistoryList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancetaskexecution')
          },
          {
            title: this.$t('xpack.Cloud.SyncInstanceTaskHistoryAssetList'),
            name: 'AssetList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancetask')

          }
        ],
        hasRightSide: true
        // getObjectName: function(obj) {
        //   return obj.hostname + '(' + obj.ip + ')'
        // }
      }
    }
  }
}
</script>

<style scoped>

</style>
