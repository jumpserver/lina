<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
      <AutoDetailCard :fields="detailFields" :object="object" :title="$tc('TaskDetail')" :url="url" />
    </el-col>
    <el-col :md="9" :sm="24">
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
import { toSafeLocalDateStr } from '@/utils/common'
import RelationCard from '@/components/Cards/RelationCard'
import QuickActions from '@/components/QuickActions'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountDetail',
  components: {
    QuickActions, RelationCard,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/xpack/cloud/accounts/${this.object.id}/`,
      excludes: ['attrs', 'task'],
      quickActions: [
        {
          title: this.$t('RunTaskManually'),
          attrs: {
            showTip: !this.object.task?.id,
            tip: this.$t('ExecCloudSyncErrorMsg'),
            type: 'primary',
            label: this.$t('Execute'),
            disabled: !this.$hasPerm('xpack.add_syncinstancetaskexecution') || !this.object.task?.id
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/run/`
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      strategyRelationConfig: {
        icon: 'fa-info',
        title: this.$t('Strategy'),
        objectsAjax: {
          url: '/api/v1/xpack/cloud/strategies/',
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        },
        hasObjectsId: this.object?.task?.strategy?.map(i => i.id) || [],
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
      detailFields: [
        {
          key: this.$t('Strategy'),
          value: this.object?.task?.strategy?.map(item => item.name).join(', ')
        },
        {
          key: this.$t('IPNetworkSegment'),
          value: this.object?.task?.ip_network_segment_group?.join(', ')
        },
        {
          key: this.$t('IsAlwaysUpdate'),
          value: this.object?.task?.is_always_update
        },
        {
          key: this.$t('CyclePerform'),
          value: this.object?.task?.is_periodic
        },
        {
          key: this.$t('Region'),
          value: this.object?.task.regions,
          formatter(row, value) {
            return (<div>{
              value?.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
        },
        {
          key: this.$t('DateLastSync'),
          value: this.object?.task?.date_last_sync ? toSafeLocalDateStr(this.object?.task.date_created) : ''
        },
        {
          key: this.$t('DateCreated'),
          value: this.object?.task.date_created ? toSafeLocalDateStr(this.object?.task.date_created) : ''
        },
        'comment'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>

