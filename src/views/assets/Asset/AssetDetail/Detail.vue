<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard ref="NodeRelation" v-perms="'assets.change_asset'" type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
      <LabelCard v-if="$hasPerm('assets.view_label')" type="warning" style="margin-top: 15px" v-bind="labelConfig" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import RelationCard from '@/components/RelationCard'
import QuickActions from '@/components/QuickActions'
import LabelCard from './components/LabelCard'
import { toSafeLocalDateStr } from '@/utils/common'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    QuickActions,
    RelationCard,
    LabelCard
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
          type: 'switcher',
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
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
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
              }
              )
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
              }
              )
            }.bind(this)
          }
        }
      ],
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.Node'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        hasObjectsId: this.object.nodes,
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.NodeRelation.iHasObjects
          value.map(v => {
            newData.push(v.value)
          })
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          items.map(v => {
            newData.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: newData })
        },
        performDelete: (item) => {
          const itemId = item.value
          const newData = []
          const value = this.$refs.NodeRelation.iHasObjects
          value.map(v => {
            if (v.value !== itemId) {
              newData.push(v.value)
            }
          })
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          return this.$axios.patch(relationUrl, { nodes: newData })
        }
      },
      labelConfig: {
        title: this.$t('assets.Label'),
        labels: this.object.labels
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Hostname'),
          value: this.object.hostname
        },
        {
          key: this.$t('assets.ip'),
          value: this.object.ip
        },
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols.toString()
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
          value: this.object.domain_display
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
          value: this.object.platform
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
