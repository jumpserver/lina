<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard v-bind="detailBasicConfig" />
      <AutoDetailCard v-bind="detailSpecInfoConfig" />
      <AutoDetailCard v-bind="detailInfoConfig" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
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
      detailBasicConfig: {
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        fields: [
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
            key: this.$t('assets.Platform'),
            value: this.object.platform.name
          },
          'is_active', 'date_created', 'created_by', 'comment'
        ]
      },
      detailSpecInfoConfig: {
        title: this.$t('common.SpecificInfo'),
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        nested: 'spec_info',
        showUndefine: false,
        excludes: ['spec_info.script']
      },
      detailInfoConfig: {
        url: `/api/v1/assets/hosts/${this.object.id}/`,
        title: this.$t('assets.HardwareInfo'),
        object: this.object,
        nested: 'info',
        showUndefine: false
      }
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
