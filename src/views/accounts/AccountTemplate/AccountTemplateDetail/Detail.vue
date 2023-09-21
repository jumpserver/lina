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
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('assets.PrivilegedTemplate'),
          type: 'switch',
          attrs: {
            model: this.object?.privileged,
            disabled: !this.$hasPerm('accounts.change_accounttemplate')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/accounts/account-templates/${this.object.id}/`,
                { privileged: val }
              ).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/account-templates/${this.object.id}/`,
      excludes: ['privileged', 'secret', 'passphrase', 'spec_info'],
      detailFields: [
        'id', 'name', 'username', 'secret_type', 'auto_push',
        'secret_strategy', 'created_by', 'comment',
        {
          key: this.$t('accounts.SuFrom'),
          formatter: () => {
            const su_from = this.object.su_from
            if (!su_from) return <span>-</span>
            return <span>{su_from.name}({su_from.username})</span>
          }
        },
        'is_active', 'date_created', 'date_updated'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
