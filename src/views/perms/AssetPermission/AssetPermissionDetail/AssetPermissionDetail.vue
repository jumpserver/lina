<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import QuickActions from '@/components/QuickActions'

export default {
  name: 'AssetPermissionDetail',
  components: {
    AutoDetailCard,
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
          type: 'switch',
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
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/perms/asset-permissions/${this.object.id}`,
      detailFields: [
        'name',
        {
          key: this.$t('perms.userCount'),
          value: this.object.users.length
        },
        {
          key: this.$t('perms.userGroupCount'),
          value: this.object.user_groups.length
        },
        {
          key: this.$t('perms.assetCount'),
          value: this.object.assets.length
        },
        {
          key: this.$t('perms.nodeCount'),
          value: this.object.nodes.length
        },
        {
          key: this.$t('perms.Actions'),
          value: this.object.actions,
          formatter(row, value) {
            const actionLabels = value.map(item => item.label.replace(/ \([^)]*\)/, ''))
            return (
              <div>
                {actionLabels.map(item => (
                  <el-tag size='mini' style={{ marginRight: '3px' }} key={item}>{item}</el-tag>
                ))}
              </div>
            )
          }
        },
        'date_start', 'date_expired', 'date_created', 'created_by', 'comment'
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [

        {
          key: this.$t('common.DateStart'),
          value: this.object.date_start
        },
        {
          key: this.$t('common.dateExpired'),
          value: this.object.date_expired
        },
        {
          key: this.$t('common.DateCreated'),
          value: this.object.date_created
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

<style lang="scss" scoped>
</style>
