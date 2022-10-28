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

export default {
  name: 'Detail',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('assets.PrivilegedTemplate'),
          type: 'switcher',
          attrs: {
            model: this.object?.privileged,
            disabled: !this.$hasPerm('assets.change_accounttemplate')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                '/api/v1/assets/account-templates/',
                { privileged: val }
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
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('users.Username'),
          value: this.object.username
        },
        {
          key: this.$t('assets.SecretType'),
          value: this.object.secret_type
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.DateJoined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        },
        {
          key: this.$t('assets.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
