<template>
  <GenericDetailPage :object.sync="remoteAppData" v-bind="config" @tab-click="TabClick">
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
      remoteAppData: {}
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
  watch: {
    remoteAppData: function(newRemoteAppData, oldRemoteAppData) {
      this.activeConfig.content[0].is_active = newRemoteAppData.is_active
      this.flag = true
    }
  },
  methods: {
    getDataLength(data) {
      if (data instanceof Array) {
        return data.length
      }
      return data
    },
    TabClick(tab) {
      if (tab.name !== 'detail') {
        this.$set(this.config, 'hasRightSide', false)
      } else {
        this.$set(this.config, 'hasRightSide', true)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
