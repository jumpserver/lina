<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, QuickActions } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'DatabaseAppPermissionDetail',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('common.actions.Activate'),
          type: 'switcher',
          attrs: {
            model: this.object.is_active
          },
          callbacks: {
            change: function(v, item) {
              const url = `/api/v1/perms/database-app-permissions/${vm.object.id}/`
              const data = { is_active: v }
              vm.$axios.patch(url, data).catch(() => {
                item.attrs.model = !v
              })
            }
          }
        }
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.id
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.table.Name'),
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
          value: this.getDataLength(this.object.database_apps)
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
          key: this.$t('common.table.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  methods: {
    getDataLength(data) {
      if (data instanceof Array) {
        return JSON.stringify(data.length)
      }
      return data
    }
  }
}
</script>

<style lang="less" scoped>

</style>
