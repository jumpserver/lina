<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AutoDetailCard v-bind="detailBasicConfig" />
      <AutoDetailCard v-bind="detailSpecInfoConfig" />
      <AutoDetailCard v-bind="detailInfoConfig" />
    </el-col>
    <el-col :md="9" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
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
import QuickActions from '@/components/QuickActions'
import { openTaskPage } from '@/utils/jms'
import RelationCard from '@/components/Cards/RelationCard/index.vue'

export default {
  name: 'Detail',
  components: {
    RelationCard,
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
      labelConfig: {
        icon: 'fa-info',
        title: this.$t('Tags'),
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
          title: this.$t('TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('Test'),
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
            key: this.$t('Category'),
            value: this.object.category.label
          },
          {
            key: this.$t('Type'),
            value: this.object.type.label
          },
          'address',
          {
            key: this.$t('Protocols'),
            value: this.object.protocols.map(i => i.name + '/' + i.port).join(',')
          },
          {
            key: this.$t('Platform'),
            value: this.object.platform.name
          },
          'is_active', 'date_created', 'created_by', 'comment'
        ]
      },
      detailSpecInfoConfig: {
        title: this.$t('SpecificInfo'),
        url: `/api/v1/assets/assets/${this.object.id}/`,
        object: this.object,
        nested: 'spec_info',
        showUndefine: false,
        excludes: ['spec_info.script']
      },
      detailInfoConfig: {
        url: `/api/v1/assets/hosts/${this.object.id}/`,
        title: this.$t('HardwareInfo'),
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
