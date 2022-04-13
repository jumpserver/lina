<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RunInfoCard type="danger" style="margin-top: 15px" v-bind="RunFailedConfig" />
      <RunInfoCard type="info" v-bind="RunSuccessConfig" style="margin-top: 15px" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'
import RunInfoCard from '../RunInfoCard/index'
import { toLastFailureDisplay, toLastSucessDisplay } from './business'
import { toSafeLocalDateStr } from '@/utils/common'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'TaskDetail',
  components: {
    DetailCard,
    RunInfoCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      RunSuccessConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunSuccessHosts'),
        contents: toLastSucessDisplay(this.object.latest_execution)
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunFailedHosts'),
        contents: toLastFailureDisplay(this.object.latest_execution)
      },
      taskData: {}
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('ops.totalVersions'),
          value: JSON.stringify(this.object.summary.total)
        },
        {
          key: this.$t('ops.latestVersion'),
          value: this.object.latest_execution,
          formatter: function(row, data) {
            const route = { to: { name: 'AdhocDetail', params: { id: data.adhoc }}}
            if (!this.$hasPerm('ops.ops.view_adhoc')) {
              return <span>{ data.adhoc_short_id }</span>
            }
            return <router-link {...{ attrs: route }}>{ data.adhoc_short_id }</router-link>
          }
        },
        {
          key: this.$t('ops.lastRun'),
          value: toSafeLocalDateStr(this.object.latest_execution.date_finished)
        },
        {
          key: this.$t('ops.timeDelta'),
          value: this.object.latest_execution.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('ops.isFinished'),
          value: this.object.latest_execution.is_finished
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.object.latest_execution.is_success
        },
        {
          key: this.$t('ops.contents'),
          value: this.toContentsDisplay(this.object.contents),
          formatter(row, value) {
            return (<div>{
              value.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
        },
        {
          key: this.$t('ops.lastExecutionOutput'),
          value: this.object.latest_execution.id,
          formatter: function(row, value) {
            const onClick = function() {
              openTaskPage(value, 'ansible')
            }
            const title = this.$t('common.View')
            return <a onClick={onClick} >{ title }</a>
          }
        }
      ]
    }
  },
  methods: {
    toContentsDisplay(contents) {
      const lines = []
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i]
        lines.push(`${i}. ${content.name} ::: ${content.action.module}`)
      }
      return lines
    }
  }
}
</script>

<style lang="less" scoped>

</style>
