<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard type="danger" style="margin-top: 15px" v-bind="RunFailedConfig" />
      <RunInfoCard type="info" v-bind="RunSuccessConfig" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'
import RunInfoCard from '../RunInfoCard/index'
import { toLastFailureDisplay, toLastSucessDisplay } from './business'

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
          key: this.$t('ops.ID'),
          value: this.object.id
        },
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('common.dateCreated'),
          value: this.$d(new Date(this.object.date_created))
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
            return <router-link {...{ attrs: route }}>{ data.adhoc_short_id }</router-link>
          }
        },
        {
          key: this.$t('ops.lastRun'),
          value: this.$d(new Date(this.object.latest_execution.date_finished))
        },
        {
          key: this.$t('ops.timeDelta'),
          value: this.object.latest_execution.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('ops.isFinished'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_finished)
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_success)
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
              window.open(`/#/ops/celery/task/${value}/log/`, '', 'width=900,height=600')
            }
            const title = this.$t('common.View')
            return <a onClick={onClick} >{ title }</a>
          }
        }
      ]
    }
  },
  methods: {
    toChoicesDisplay(c) {
      if (!c) {
        return this.$t('ops.No')
      }
      return this.$t('ops.Yes')
    },
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
