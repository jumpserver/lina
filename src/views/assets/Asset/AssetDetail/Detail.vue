<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard ref="NodeRelation" v-perms="'assets.change_asset'" type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
      <LabelCard v-if="$hasPerm('assets.view_label')" type="warning" style="margin-top: 15px" v-bind="labelConfig" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import RelationCard from '@/components/RelationCard'
import QuickActions from '@/components/QuickActions'
import LabelCard from './components/LabelCard'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
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
        hasObjectsId: this.object.nodes?.map(i => i.id) || [],
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
      },
      url: '/api/v1/assets/assets/',
      detailFields: [
        'name',
        {
          key: this.$t('assets.Category'),
          value: this.object.category.label
        },
        {
          key: this.$t('assets.Type'),
          value: this.object.type.label
        },
        'address',
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols.map(i => i.name + '/' + i.port).join(',')
        },
        {
          key: this.$t('assets.Domain'),
          value: this.object.domain?.name || ''
        },
        {
          key: this.$t('assets.Platform'),
          value: this.object.platform.label
        },
        'is_active', 'date_created', 'created_by', 'comment'
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
