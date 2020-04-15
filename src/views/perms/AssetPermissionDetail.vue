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
    <div slot="assetAndNode">
      <el-row :gutter="20">
        <el-col :span="14">
          <ListTable :table-config="tableConfig.assetAndNode" :header-actions="headerActions" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ assetCardActions }}</span>
            </div>
            <div>
              <Select2 v-model="selectAsset.value" v-bind="selectAsset" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="box-card success">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ nodeCardActions }}</span>
            </div>
            <div>
              <Select2 v-model="selectNode.value" v-bind="selectNode" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="box-card warning">
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
import { getAssetPermissionDetail } from '@/api/perms'
import Select2 from '@/components/Select2'

export default {
  name: 'AssetPermissionDetail',
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
          url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/users/all/`,
          columns: [
            'user_display'
          ],
          columnsMeta: {
            user_display: {
              label: this.$t('perms.User')
            }
          }
        },
        assetAndNode: {
          url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/assets/all/`,
          columns: [
            'asset_display'
          ],
          columnsMeta: {
            asset_display: {
              label: this.$t('perms.Asset')
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
      assetData: {},
      submenu: [
        {
          title: this.$t('perms.AssetPermissionDetail'),
          name: 'detail'
        },
        {
          title: this.$t('perms.UsersAndUserGroups'),
          name: 'userAndUserGroups'
        },
        {
          title: this.$t('perms.AssetAndNode'),
          name: 'assetAndNode'
        }
      ],
      assetPermissionUser: [],
      assetPermissionUserGroup: [],
      assetPermissionAsset: [],
      assetPermissionNode: [],
      assetPermissionSystemUser: [],
      selectUser: {
        url: '/api/v1/users/users/',
        initial: this.assetPermissionUser,
        value: []
      },
      selectUserGroup: {
        url: '/api/v1/users/groups/',
        initial: this.assetPermissionUserGroup,
        value: []
      },
      selectAsset: {
        url: '/api/v1/assets/assets/',
        initial: this.assetPermissionAsset,
        value: []
      },
      selectNode: {
        url: '/api/v1/assets/nodes/',
        initial: this.assetPermissionNode,
        value: []
      },
      selectSystemUser: {
        url: '/api/v1/assets/system-users/',
        initial: this.assetPermissionSystemUser,
        value: []
      }
    }
  },
  computed: {
    title() {
      return this.$t('perms.AssetPermissionDetail')
    },
    cardTitle() {
      return this.assetData.id
    },
    detailCardActions() {
      return this.$t('perms.QuickModify')
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.assetData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.assetData.users
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.assetData.user_groups
        },
        {
          key: this.$t('perms.AssetCount'),
          value: this.assetData.assets
        },
        {
          key: this.$t('perms.NodeCount'),
          value: this.assetData.nodes
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.assetData.system_users
        },
        {
          key: this.$t('perms.DateStart'),
          // value: toSafeLocalDateStr(this.assetData.date_start),
          value: this.assetData.date_start
        },
        {
          key: this.$t('perms.DateExpired'),
          // value: toSafeLocalDateStr(this.assetData.date_expired),
          value: this.assetData.date_expired
        },
        {
          key: this.$t('perms.DateCreated'),
          value: '没有这个字段'
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: '没有这个字段'
        },
        {
          key: this.$t('common.Comment'),
          value: this.assetData.comment
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
    assetCardActions() {
      return this.$t('perms.Asset')
    },
    nodeCardActions() {
      return this.$t('perms.Node')
    },
    systemUserCardActions() {
      return this.$t('perms.SystemUser')
    }
  },
  mounted() {
    getAssetPermissionDetail(this.$route.params.id).then(data => {
      console.log('详情页的数据==>', data)
      this.assetData = data
    })
  },
  methods: {
    HandleChangeAction: function(index, row) {
      const url = `/api/v1/perms/asset-permissions/${this.$route.params.id}/`
      console.log('点击激活的url==>', url)
      console.log('激活的数据==>', row)
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
