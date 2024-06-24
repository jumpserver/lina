<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AutoDetailCard v-bind="basicInfoConfig" />
      <AutoDetailCard v-if="isShowSpecInfo" v-bind="specInfoConfig" />
      <AutoDetailCard v-bind="customInfoConfig" />
      <AutoDetailCard v-bind="gatheredInfoConfig" />
    </el-col>
    <el-col :md="9" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <RelationCard
        ref="NodeRelation"
        v-perms="'assets.change_asset'"
        style="margin-top: 15px"
        type="info"
        v-bind="nodeRelationConfig"
      />
      <RelationCard
        ref="LabelRelation"
        v-perms="'assets.view_label'"
        style="margin-top: 15px"
        type="warning"
        v-bind="labelConfig"
      />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import RelationCard from '@/components/Cards/RelationCard'
import QuickActions from '@/components/QuickActions'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('IsActive'),
          type: 'switch',
          attrs: {
            label: this.$t('Test'),
            model: this.object.is_active,
            disabled: !vm.$hasPerm('assets.change_asset')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/assets/assets/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('RefreshHardware'),
          attrs: {
            type: 'primary',
            label: this.$t('Refresh'),
            disabled: !vm.$hasPerm('assets.refresh_assethardwareinfo') ||
              !this.object['auto_config'].gather_facts_enabled ||
              !this.object['auto_config'].ansible_enabled ||
              this.$store.getters.currentOrgIsRoot
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
          title: this.$t('TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('Test'),
            disabled: !vm.$hasPerm('assets.test_assetconnectivity') ||
              !this.object['auto_config'].ansible_enabled ||
              !this.object['auto_config']['ping_enabled'] ||
              this.$store.getters.currentOrgIsRoot
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
        title: this.$t('Node'),
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
        icon: 'fa-info',
        title: this.$t('Label'),
        allowCreate: true,
        objectsAjax: {
          url: '/api/v1/labels/labels/',
          transformOption: (item) => {
            const label = String(item.name) + ':' + String(item.value)
            return { label: label, value: label }
          }
        },
        hasObjectsId: this.object.labels,
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.LabelRelation.iHasObjects
          value.map(v => newData.push(v.label))
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          items.map(v => newData.push(v.label))
          return this.$axios.patch(relationUrl, { labels: newData })
        },
        getHasObjects: (ids) => {
          return new Promise((resolve) => {
            return resolve(ids.map(id => ({ value: id, label: id })))
          })
        },
        performDelete: (item) => {
          const itemId = item.value
          const value = this.$refs.LabelRelation.iHasObjects
          const newData = value.filter(v => v.value !== itemId).map(v => v.value)
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          return this.$axios.patch(relationUrl, { labels: newData })
        }
      },
      basicInfoConfig: {
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        fields: [
          'id', 'name', 'category', 'type',
          'address', 'platform', 'protocols', 'domain',
          'is_active', 'date_created', 'date_updated',
          'created_by', 'comment'
        ],
        formatters: {
          protocols: () => {
            return vm.object.protocols.map(
              i => (
                this.object.address.startsWith('https://') ? 'https' : i.name
              ) + '/' + i.port
            ).join(', ')
          }
        }
      },
      specInfoConfig: {
        title: this.$t('SpecificInfo'),
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        nested: 'spec_info',
        showUndefine: true
      },
      customInfoConfig: {
        title: this.$t('CustomInfo'),
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        nested: 'custom_info',
        showUndefine: false
      },
      gatheredInfoConfig: {
        url: `/api/v1/assets/hosts/${this.object.id}/`,
        title: this.$t('HardwareInfo'),
        object: this.object,
        nested: 'gathered_info',
        showUndefine: false
      }
    }
  },
  computed: {
    isShowSpecInfo() {
      const object = this.object
      const type = object.type.value
      const autofill = object.spec_info?.autofill
      return !(type === 'website' && autofill === 'script') && Object.keys(object.spec_info || {}).length > 0
    }
  },
  mounted() {
  },
  methods: {}
}
</script>

<style lang='less' scoped>

</style>
