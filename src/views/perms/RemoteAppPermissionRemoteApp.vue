<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-if="!remoteAppReletionConfig.loading" v-bind="remoteAppReletionConfig" />
      <RelationCard v-if="!systemUserReletionConfig.loading" v-bind="systemUserReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'

export default {
  name: 'RemoteAppPermissionUser',
  components: {
    ListTable,
    RelationCard
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/remote-app-permissions/${this.$route.params.id}/remote-apps/all/`,
        columns: [
          // 'remote_app_display'
        ],
        columnsMeta: {
          // asset_display: {
          //   label: this.$t('perms.RemoteApp')
          // }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      },
      remoteAppPermissionRemoteApp: [],
      remoteAppPermissionSystemUser: [],
      remoteAppReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add RemoteApp to this permission'),
        url: '/api/v1/applications/remote-apps/',
        value: [],
        loading: false
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add System User to this permission'),
        url: '/api/v1/assets/system-users/',
        value: [],
        loading: false
      }
    }
  }
}
</script>

<style scoped>

</style>
