<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
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
      <AssetPermissionUser />
    </div>
    <div slot="assetAndNode">
      <AssetPermissionAsset />
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import { getAssetPermissionDetail } from '@/api/perms'
import { toSafeLocalDateStr } from '@/utils/common'
import AssetPermissionUser from './AssetPermissionUser'
import AssetPermissionAsset from './AssetPermissionAsset'

export default {
  name: 'AssetPermissionDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    AssetPermissionUser,
    AssetPermissionAsset
  },
  data() {
    return {
      flag: false,
      activeSubMenu: 'detail',
      assetPermissionData: {},
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
      ]
    }
  },
  computed: {
    title() {
      return this.$t('perms.AssetPermissionDetail')
    },
    cardTitle() {
      return this.assetPermissionData.id
    },
    detailCardActions() {
      return this.$t('perms.QuickModify')
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.assetPermissionData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.getDataLength(this.assetPermissionData.users)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.getDataLength(this.assetPermissionData.user_groups)
        },
        {
          key: this.$t('perms.AssetCount'),
          value: this.getDataLength(this.assetPermissionData.assets)
        },
        {
          key: this.$t('perms.NodeCount'),
          value: this.getDataLength(this.assetPermissionData.nodes)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.getDataLength(this.assetPermissionData.system_users)
        },
        {
          key: this.$t('perms.DateStart'),
          value: toSafeLocalDateStr(this.assetPermissionData.date_start)
        },
        {
          key: this.$t('perms.DateExpired'),
          // value: toSafeLocalDateStr(this.assetData.date_expired),
          value: toSafeLocalDateStr(this.assetPermissionData.date_expired)
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
          value: this.assetPermissionData.comment
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
    }
  },
  mounted() {
    this.getAssetPermissionDetailData()
  },
  methods: {
    getAssetPermissionDetailData() {
      getAssetPermissionDetail(this.$route.params.id).then(data => {
        this.assetPermissionData = data
        this.flag = true
      })
    },
    HandleChangeAction: function(index, row) {
      const url = `/api/v1/perms/asset-permissions/${this.$route.params.id}/`
      console.log(url)
    },
    getDataLength(data) {
      if (data instanceof Array) {
        return data.length
      }
      return data
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
