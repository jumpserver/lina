<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import { openTaskPage } from '@/utils/jms'

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
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('assets.IsActive'),
          type: 'switch',
          attrs: {
            label: this.$t('common.Test'),
            model: this.object.is_active,
            disabled: !vm.$hasPerm('assets.change_asset')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/assets/assets/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.RefreshHardware'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Refresh'),
            disabled: !vm.$hasPerm('assets.refresh_assethardwareinfo')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/assets/${this.object.id}/tasks/`,
                { action: 'refresh' }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test'),
            disabled: !vm.$hasPerm('assets.test_assetconnectivity')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/assets/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/terminal/applet-hosts/${this.object.id}`,
      detailFields: [
        'name', 'ip',
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols.map(i => i.name).join(',')
        },
        'public_ip', 'admin_user_display',
        {
          key: this.$t('assets.Domain'),
          value: this.object.domain?.name || ''
        },
        'vendor', 'model', 'cpu_model', 'memory', 'disk_info',
        {
          key: this.$t('assets.Platform'),
          value: this.object.platform?.name || ''
        },
        'os_arch', 'is_active', 'sn', 'number', 'date_created',
        'created_by', 'comment'
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
