<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <el-card class="box-card primary">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ userCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectUser.value" v-bind="selectUser" />
        </div>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card success">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ userGroupCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectUserGroup.value" v-bind="selectUserGroup" />
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
        url: `/api/v1/perms/remote-app-permissions/${this.$route.params.id}/users/all/`,
        columns: [
          // 'user_display'
        ],
        columnsMeta: {
          // user_display: {
          //   label: this.$t('perms.User')
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
      remoteAppPermissionUser: [],
      remoteAppPermissionUserGroup: [],
      selectUser: {
        url: '/api/v1/users/users/',
        initial: this.remoteAppPermissionUser,
        value: []
      },
      selectUserGroup: {
        url: '/api/v1/users/groups/',
        initial: this.remoteAppPermissionUserGroup,
        value: []
      }
    }
  },
  computed: {
    userCardActions() {
      return this.$t('perms.User')
    },
    userGroupCardActions() {
      return this.$t('perms.UserGroups')
    }
  }
}
</script>

<style scoped>

</style>
