<template>
  <GenericDetailPage :object.sync="remoteAppPermission" v-bind="config">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :span="10">
          <ActiveCard v-bind="activeConfig" />
        </el-col>
      </el-row>
    </div>
    <div slot="userAndUserGroups">
      <RemoteAppPermissionUser />
    </div>
    <div slot="remoteApp">
      <RemoteAppPermissionRemoteApp />
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { DetailCard, ActiveCard } from '@/components'
import { getRemoteAppPermissionDetail } from '@/api/perms'
import { toSafeLocalDateStr } from '@/utils/common'
import RemoteAppPermissionUser from './RemoteAppPermissionUser'
import RemoteAppPermissionRemoteApp from './RemoteAppPermissionRemoteApp'

export default {
  name: 'RemoteAppPermissionDetail',
  components: {
    RemoteAppPermissionUser,
    RemoteAppPermissionRemoteApp,
    GenericDetailPage,
    DetailCard,
    ActiveCard
  },
  data() {
    return {
      flag: false,
      remoteAppPermission: { name: '' },
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('perms.RemoteAppPermissionDetail'),
            name: 'detail'
          },
          {
            title: this.$t('perms.UsersAndUserGroups'),
            name: 'userAndUserGroups'
          },
          {
            title: this.$t('perms.RemoteApp'),
            name: 'remoteApp'
          }
        ]
      },
      activeConfig: {
        icon: 'fa-info',
        title: this.$t('perms.QuickModify'),
        content: [
          {
            name: this.$t('perms.Active'),
            is_active: true
          }
        ],
        url: `/api/v1/perms/remote-app-permissions/${this.$route.params.id}/`
      },
      remoteAppData: {},
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
    cardTitle() {
      return this.remoteAppData.id
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.remoteAppData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.getDataLength(this.remoteAppData.users)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.getDataLength(this.remoteAppData.user_groups)
        },
        {
          key: this.$t('perms.RemoteAppCount'),
          value: this.getDataLength(this.remoteAppData.remote_apps)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.getDataLength(this.remoteAppData.system_users)
        },
        {
          key: this.$t('perms.DateStart'),
          value: toSafeLocalDateStr(this.remoteAppData.date_start)
        },
        {
          key: this.$t('perms.DateExpired'),
          value: toSafeLocalDateStr(this.remoteAppData.date_expired)
        },
        {
          key: this.$t('perms.DateCreated'),
          value: toSafeLocalDateStr(this.remoteAppData.date_created)
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: this.remoteAppData.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: this.remoteAppData.comment
        }
      ]
    }
  },
  mounted() {
    this.getRemoteAppPermissionDetailData()
  },
  methods: {
    getRemoteAppPermissionDetailData() {
      getRemoteAppPermissionDetail(this.$route.params.id).then(data => {
        this.remoteAppData = data
        this.activeConfig.content[0].is_active = data.is_active
        this.flag = true
      })
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
