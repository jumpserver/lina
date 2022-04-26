<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="16" :sm="24">
        <AccountListTable ref="ListTable" :url="assetUserUrl" :has-import="false" :has-clone="false" :has-left-actions="true" />
      </el-col>
      <el-col :md="8" :sm="24">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions'
import { AccountListTable } from '@/components'
import { openTaskPage } from '@/utils/jms'

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
      assetUserUrl: `/api/v1/assets/accounts/?asset=${this.object.id}`,
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
                `/api/v1/assets/accounts/tasks/?asset=${this.object.id}`,
                { action: 'test' }
              ).then(res => {
                openTaskPage(res['task'])
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
