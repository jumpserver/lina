<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <RelationCard
        ref="StrategyRelation"
        v-perms="'xpack.change_strategy'"
        style="margin-top: 15px"
        type="info"
        v-bind="strategyRelationConfig"
      />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import RelationCard from '@/components/Cards/RelationCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
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
      default: () => {}
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('xpack.Cloud.RunTaskManually'),
          attrs: {
            type: 'primary',
            label: this.$t('xpack.Execute'),
            disabled: !this.$hasPerm('xpack.add_syncinstancetaskexecution')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/run/`
              ).then(res => {
                openTaskPage(res['task'])
              }
              )
            }.bind(this)
          }
        }
      ],
      strategyRelationConfig: {
        icon: 'fa-info',
        title: this.$t('common.Strategy'),
        objectsAjax: {
          url: '/api/v1/xpack/cloud/strategies/',
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        },
        hasObjectsId: this.object.strategy?.map(i => i.id) || [],
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.StrategyRelation.iHasObjects
          value.map(v => {
            newData.push(v.value)
          })
          const relationUrl = `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/`
          items.map(v => {
            newData.push(v.value)
          })
          return this.$axios.patch(relationUrl, { strategy: newData })
        },
        performDelete: (item) => {
          const itemId = item.value
          const newData = []
          const value = this.$refs.StrategyRelation.iHasObjects
          value.map(v => {
            if (v.value !== itemId) {
              newData.push(v.value)
            }
          })
          const relationUrl = `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/`
          return this.$axios.patch(relationUrl, { strategy: newData })
        }
      },
      url: `/api/v1/xpack/cloud/accounts/${this.object.id}`,
      detailFields: [
        'name', 'account_display', 'node_display',
        {
          key: this.$t('common.Strategy'),
          value: this.object.strategy?.map(item => item.name).join(', ')
        },
        {
          key: this.$t('xpack.Cloud.IPNetworkSegment'),
          value: this.object.ip_network_segment_group?.join(', ')
        },
        'is_always_update', 'is_periodic', 'periodic_display',
        {
          key: this.$t('xpack.Cloud.DateLastSync'),
          value: this.object.date_last_sync ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.DateCreated'),
          value: this.object.date_created ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.Region'),
          value: this.object.regions,
          formatter(row, value) {
            return (<div>{
              value?.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
        },
        'comment'
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
