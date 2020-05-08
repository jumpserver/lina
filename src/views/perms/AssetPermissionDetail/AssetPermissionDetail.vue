<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <ActiveCard type="primary" v-bind="activeConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, ActiveCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AssetPermissionDetail',
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
      activeConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.QuickModify'),
        content: [
          {
            name: this.$t('perms.Active'),
            is_active: this.object.is_active
          }
        ],
        url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/`
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
          key: this.$t('perms.AssetCount'),
          value: this.getDataLength(this.object.assets)
        },
        {
          key: this.$t('perms.NodeCount'),
          value: this.getDataLength(this.object.nodes)
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
          value: '没有这个字段'
        },
        {
          key: this.$t('perms.CreatedBy'),
          value: '没有这个字段'
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
        return JSON.stringify(data.length)
      }
      return data
    }
  }
}
</script>

<style lang="less" scoped>

</style>
