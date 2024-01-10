<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
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
    const vm = this
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'detail',
        url: '/api/v1/xpack/cloud/sync-instance-tasks',
        actions: {
          canDelete: vm.$hasPerm('xpack.delete_syncinstancetask'),
          canUpdate: vm.$hasPerm('xpack.change_syncinstancetask'),
          deleteSuccessRoute: 'CloudCenter'
        },
        submenu: [
          {
            title: this.$t('SyncInstanceTaskDetail'),
            name: 'detail'
          },
          {
            title: this.$t('SyncInstanceTaskHistoryList'),
            name: 'HistoryList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancetaskexecution')
          },
          {
            title: this.$t('SyncInstanceTaskHistoryAssetList'),
            name: 'AssetList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancedetail')

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
