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
// import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AssetPermissionDetail',
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
          title: this.$t('common.Activate'),
          type: 'switcher',
          attrs: {
            model: this.object.is_active
          },
          callbacks: {
            change: function(v, item) {
              const url = `/api/v1/perms/asset-permissions/${vm.object.id}/`
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
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('perms.UserCount'),
          // value: this.getDataLength(this.object.users)
          value: JSON.stringify(this.object.users_amount)
        },
        {
          key: this.$t('perms.UserGroupCount'),
          value: JSON.stringify(this.object.assets_amount)
        },
        {
          key: this.$t('perms.AssetCount'),
          value: JSON.stringify(this.object.users_amount)
        },
        {
          key: this.$t('perms.NodeCount'),
          value: JSON.stringify(this.object.nodes_amount)
        },
        {
          key: this.$t('perms.SystemUserCount'),
          value: JSON.stringify(this.object.system_users_amount)
        },
        {
          key: this.$t('perms.DateStart'),
          value: 'api没有这个字段'
        },
        {
          key: this.$t('perms.DateExpired'),
          value: 'api没有这个字段'
        },
        {
          key: this.$t('perms.DateCreated'),
          value: this.object.date_created
        },
        {
          key: this.$t('perms.createdBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: 'api没有这个字段'
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
