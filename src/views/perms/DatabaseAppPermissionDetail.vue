<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ detailCardActions }}</span>
            </div>
            <el-table class="el-table" :data="detailCardActionData" :show-header="false">
              <el-table-column prop="name" />
              <el-table-column prop="is_active" align="right">
                <template slot-scope="scope">
                  <el-switch
                    v-model="scope.row.is_active"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    @change="HandleChangeAction(scope.$index, scope.row)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div slot="userAndUserGroups">
      <el-row :gutter="20">
        <el-col :span="14">
          <ListTable :table-config="tableConfig.userAndUserGroups" :header-actions="headerActions" />
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
    </div>
    <div slot="databaseApp">
      <el-row :gutter="20">
        <el-col :span="14">
          <ListTable :table-config="tableConfig.databaseApp" :header-actions="headerActions" />
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
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import ListTable from '@/components/ListTable'
import { getDatabaseAppPermissionDetail } from '@/api/perms'
import Select2 from '@/components/Select2'

export default {
  name: 'DatabaseAppPermissionDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    ListTable,
    Select2
  },
  data() {
    return {
      tableConfig: {
        userAndUserGroups: {
          url: `/api/v1/perms/database-app-permissions/${this.$route.params.id}/users/all/`,
          columns: [
            'user_display'
          ],
          columnsMeta: {
            user_display: {
              label: this.$t('perms.User')
            }
          }
        },
        databaseApp: {
          url: `/api/v1/perms/database-app-permissions/${this.$route.params.id}/database-apps/all/`,
          columns: [
            'databaseapp_display'
          ],
          columnsMeta: {
            databaseapp_display: {
              label: this.$t('perms.DatabaseApp')
            }
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
      activeSubMenu: 'detail',
      databaseAppData: {},
      submenu: [
        {
          title: this.$t('perms.DatabaseAppPermissionDetail'),
          name: 'detail'
        },
        {
          title: this.$t('perms.UsersAndUserGroups'),
          name: 'userAndUserGroups'
        },
        {
          title: this.$t('perms.DatabaseApp'),
          name: 'databaseApp'
        }
      ],
      databaseAppPermissionUser: [],
      databaseAppPermissionUserGroup: [],
      databaseAppPermissionDatabaseApp: [],
      databaseAppPermissionSystemUser: [],
      selectUser: {
        url: '/api/v1/users/users/',
        initial: this.databaseAppPermissionUser,
        value: []
      },
      selectUserGroup: {
        url: '/api/v1/users/groups/',
        initial: this.databaseAppPermissionUserGroup,
        value: []
      },
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
    title() {
      return this.$t('perms.DatabaseAppPermissionDetail')
    },
    cardTitle() {
      return this.databaseAppData.id
    },
    detailCardActions() {
      return this.$t('perms.QuickModify')
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.databaseAppData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.databaseAppData.users
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.databaseAppData.user_groups
        },
        {
          key: this.$t('perms.RemoteAppCount'),
          value: this.databaseAppData.database_apps
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.databaseAppData.system_users
        },
        {
          key: this.$t('perms.DateStart'),
          value: this.databaseAppData.date_start
        },
        {
          key: this.$t('perms.DateExpired'),
          value: this.databaseAppData.date_expired
        },
        {
          key: this.$t('perms.DateCreated'),
          value: this.databaseAppData.date_created
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: this.databaseAppData.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: this.databaseAppData.comment
        }
      ]
    },
    detailCardActionData() {
      return [
        {
          name: this.$t('perms.Active'),
          is_active: true
        }
      ]
    },
    userCardActions() {
      return this.$t('perms.User')
    },
    userGroupCardActions() {
      return this.$t('perms.UserGroups')
    },
    databaseAppCardActions() {
      return this.$t('perms.Add DatabaseApp to this permission')
    },
    systemUserCardActions() {
      return this.$t('perms.SystemUser')
    }
  },
  mounted() {
    getDatabaseAppPermissionDetail(this.$route.params.id).then(data => {
      console.log('详情数据==>', data)
      this.databaseAppData = data
    })
  },
  methods: {
    HandleChangeAction: function(index, row) {
      const url = `/api/v1/perms/database-app-permissions/${this.$route.params.id}/`
      console.log('点击激活的url===>', url)
      console.log('激活的数据===>', row)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table /deep/ .el-table__row > td {
    line-height: 1.5;
    padding: 8px 0;
  }
  .el-table /deep/ .el-table__row > td> div > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .el-table /deep/ .el-table__header > thead > tr >th {
    padding: 8px 0;
    background-color: #F5F5F6;
    font-size: 13px;
    line-height: 1.5;
  }
  .table{
    margin-top: 15px;
  }
</style>
