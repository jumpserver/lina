<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <el-card class="box-card primary">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ databaseAppCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectDatabaseApp.value" v-bind="selectDatabaseApp" />
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
  name: 'DatabaseAppPermissionDatabaseApp',
  components: {
    ListTable,
    Select2
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/${this.$route.params.id}/database-apps/all/`,
        columns: [
          'databaseapp_display'
        ],
        columnsMeta: {
          databaseapp_display: {
            label: this.$t('perms.DatabaseApp')
          }
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
      databaseAppPermissionDatabaseApp: [],
      databaseAppPermissionSystemUser: [],
      selectDatabaseApp: {
        url: '/api/v1/applications/database-apps/',
        initial: this.databaseAppPermissionDatabaseApp,
        value: []
      },
      selectSystemUser: {
        url: '/api/v1/assets/system-users/',
        initial: this.databaseAppPermissionSystemUser,
        value: []
      }
    }
  },
  computed: {
    databaseAppCardActions() {
      return this.$t('perms.Add DatabaseApp to this permission')
    },
    systemUserCardActions() {
      return this.$t('perms.SystemUser')
    }
  }
}
</script>

<style scoped>

</style>
