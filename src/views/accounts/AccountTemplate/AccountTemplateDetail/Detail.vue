<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :object="object" :excludes="excludes" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
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
      default: () => {}
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
            disabled: !this.$hasPerm('assets.change_accounttemplate')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/assets/account-templates/${this.object.id}/`,
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
      url: `/api/v1/assets/account-templates/${this.object.id}`,
      excludes: ['privileged', 'secret', 'passphrase', 'specific']
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
