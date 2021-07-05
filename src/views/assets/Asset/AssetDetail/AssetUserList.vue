<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="16">
        <AccountListTable ref="ListTable" :url="assetUserUrl" :has-import="false" :has-clone="false" />
      </el-col>
      <el-col :span="8">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions'
import { AccountListTable } from '@/components'

export default {
  name: 'Detail',
  components: {
    AccountListTable,
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
      assetUserUrl: `/api/v1/assets/accounts/?asset_id=${this.object.id}&latest=1`,
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/accounts/tasks/?asset_id=${this.object.id}&latest=1`,
                { action: 'test' }
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
