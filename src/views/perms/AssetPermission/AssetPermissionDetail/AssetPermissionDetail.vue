<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
import { ACTIONS_FIELDS_MAP } from './const'

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
    return {
      quickActions: [
        {
          title: this.$t('common.Active'),
          type: 'switcher',
          attrs: {
            model: this.object.is_active,
            disabled: !this.$hasPerm('perms.change_assetpermission')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/perms/asset-permissions/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('perms.userCount'),
          value: this.object.users_amount
        },
        {
          key: this.$t('perms.userGroupCount'),
          value: this.object.user_groups_amount
        },
        {
          key: this.$t('perms.assetCount'),
          value: this.object.assets_amount
        },
        {
          key: this.$t('perms.nodeCount'),
          value: this.object.nodes_amount
        },
        {
          key: this.$t('perms.systemUserCount'),
          value: this.object.system_users_amount
        },
        {
          key: this.$t('perms.Actions'),
          value: this.object.actions,
          formatter(row, value) {
            const actionMap = value.map(item => ACTIONS_FIELDS_MAP[item].action).join(',')
            return <span>{actionMap}</span>
          }
        },
        {
          key: this.$t('perms.dateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(this.object.date_expired)
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.createdBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>

</style>
