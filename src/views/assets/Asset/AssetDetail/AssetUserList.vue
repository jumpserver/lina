<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="16">
        <AssetUserTable ref="ListTable" :url="assetUserUrl" :has-import="false" />
      </el-col>
      <el-col :span="8">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions'
import { AssetUserTable } from '@/components'

export default {
  name: 'Detail',
  components: {
    AssetUserTable,
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
      assetUserUrl: `/api/v1/assets/asset-users/?asset_id=${this.object.id}&latest=1`,
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
                `/api/v1/assets/asset-users/tasks/?asset_id=${this.object.id}&latest=1`,
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
