<template><div>
  <el-row :gutter="20">
    <el-col :span="16">
      <AssetUserTable :url="assetUserUrl" />
    </el-col>
    <el-col :span="8">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</div>
</template>

<script>
import QuickActions from '@/components/QuickActions/index'
import { AssetUserTable } from '@/components'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    AssetUserTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      assetUserUrl: `/api/v1/assets/asset-users/?prefer_id=${this.object.id}&prefer=admin_user&latest=1`,

      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/assets/admin-users/${this.object.id}/connective/`
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ]
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
