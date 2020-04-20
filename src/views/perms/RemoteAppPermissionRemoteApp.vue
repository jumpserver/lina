<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <el-card class="box-card primary">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ remoteAppCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectRemoteApp.value" v-bind="selectRemoteApp" />
        </div>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card success">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ systemUserCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectSystemUser.value" v-bind="selectSystemUser" />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import Select2 from '@/components/Select2'

export default {
  name: 'RemoteAppPermissionUser',
  components: {
    ListTable,
    Select2
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
      selectRemoteApp: {
        url: '/api/v1/applications/remote-apps/',
        initial: this.remoteAppPermissionRemoteApp,
        value: []
      },
      selectSystemUser: {
        url: '/api/v1/assets/system-users/',
        initial: this.remoteAppPermissionSystemUser,
        value: []
      }
    }
  },
  computed: {
    remoteAppCardActions() {
      return this.$t('perms.RemoteApp')
    },
    systemUserCardActions() {
      return this.$t('perms.SystemUser')
    }
  }
}
</script>

<style scoped>

</style>
