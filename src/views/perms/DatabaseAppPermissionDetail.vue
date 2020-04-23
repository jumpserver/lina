<template>
  <GenericDetailPage :object.sync="databaseAppData" v-bind="config">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :md="10" :sm="24">
          <ActiveCard v-bind="activeConfig" />
        </el-col>
      </el-row>
    </div>
    <div slot="userAndUserGroups">
      <DatabaseAppPermissionUser />
    </div>
    <div slot="databaseApp">
      <DatabaseAppPermissionDatabaseApp />
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { DetailCard, ActiveCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'
import DatabaseAppPermissionUser from './DatabaseAppPermissionUser'
import DatabaseAppPermissionDatabaseApp from './DatabaseAppPermissionDatabaseApp'

export default {
  name: 'DatabaseAppPermissionDetail',
  components: {
    DatabaseAppPermissionDatabaseApp,
    DatabaseAppPermissionUser,
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
        url: `/api/v1/perms/database-app-permissions/${this.$route.params.id}/`
      },
      databaseAppData: {}
    }
  },
  computed: {
    cardTitle() {
      return this.databaseAppData.id
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.databaseAppData.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.getDataLength(this.databaseAppData.users)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.getDataLength(this.databaseAppData.user_groups)
        },
        {
          key: this.$t('perms.RemoteAppCount'),
          value: this.getDataLength(this.databaseAppData.database_apps)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.getDataLength(this.databaseAppData.system_users)
        },
        {
          key: this.$t('perms.DateStart'),
          value: toSafeLocalDateStr(this.databaseAppData.date_start)
        },
        {
          key: this.$t('perms.DateExpired'),
          value: toSafeLocalDateStr(this.databaseAppData.date_expired)
        },
        {
          key: this.$t('perms.DateCreated'),
          value: toSafeLocalDateStr(this.databaseAppData.date_created)
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
    }
  },
  watch: {
    databaseAppData: function(newDatabaseAppData, oldDatabaseAppData) {
      this.activeConfig.content[0].is_active = newDatabaseAppData.is_active
      this.flag = true
    }
  },
  methods: {
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

</style>
