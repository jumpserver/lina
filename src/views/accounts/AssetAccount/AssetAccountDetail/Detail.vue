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
import { openTaskPage } from '@/utils/jms'

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
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('assets.Privileged'),
          type: 'switcher',
          attrs: {
            model: vm.object.privileged,
            disabled: !vm.$hasPerm('assets.change_account')
          },
          callbacks: Object.freeze({
            change: (val) => {
              this.$axios.patch(
                `/api/v1/assets/accounts/${this.object.id}/`,
                { name: this.object?.name, privileged: val }
              ).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('assets.TestAccountConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test'),
            disabled: !vm.$hasPerm('assets.test_account')
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/assets/accounts/${this.object.id}/verify/`,
                { action: 'test' }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
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
          value: this.object.secret_type.label
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
