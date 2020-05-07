<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <ActiveCard v-bind="activeConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, ActiveCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RemoteAppPermissionDetail',
  components: {
    DetailCard,
    ActiveCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
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
      }
    }
  },
  computed: {
    cardTitle() {
      return this.object.id
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('perms.UserCount'),
          value: this.getDataLength(this.object.users)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: this.getDataLength(this.object.user_groups)
        },
        {
          key: this.$t('perms.RemoteAppCount'),
          value: this.getDataLength(this.object.remote_apps)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: this.getDataLength(this.object.system_users)
        },
        {
          key: this.$t('perms.DateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
        },
        {
          key: this.$t('perms.DateExpired'),
          value: toSafeLocalDateStr(this.object.date_expired)
        },
        {
          key: this.$t('perms.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
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
