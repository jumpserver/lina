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
          key: this.$t('assets.ip'),
          value: this.object.ip
        },
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols.map(i => i.name).join(',')
        },
        {
          key: this.$t('assets.PublicIp'),
          value: this.object.public_ip
        },
        {
          key: this.$t('assets.AdminUser'),
          value: this.object.admin_user_display
        },
        {
          key: this.$t('assets.Domain'),
          value: this.object.domain?.name || ''
        },
        {
          key: this.$t('assets.Vendor'),
          value: this.object.vendor
        },
        {
          key: this.$t('assets.Model'),
          value: this.object.model
        },
        {
          key: this.$t('assets.Cpu'),
          value: this.object.cpu_model
        },
        {
          key: this.$t('assets.Memory'),
          value: this.object.memory
        },
        {
          key: this.$t('assets.Disk'),
          value: this.object.disk_info
        },
        {
          key: this.$t('assets.Platform'),
          value: this.object.platform?.name || ''
        },
        {
          key: this.$t('assets.Os'),
          value: this.object.os_arch
        },
        {
          key: this.$t('assets.IsActive'),
          value: this.object.is_active
        },
        {
          key: this.$t('assets.SerialNumber'),
          value: this.object.sn
        },
        {
          key: this.$t('assets.AssetNumber'),
          value: this.object.number
        },
        {
          key: this.$t('assets.DateJoined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('assets.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
