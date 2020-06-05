<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard type="info" v-bind="RunSuccessConfig" />
      <RunInfoCard type="danger" style="margin-top: 15px" v-bind="RunFailedConfig" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'
import RunInfoCard from '../RunInfoCard/index'

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
      quickActions: [
        {
          title: this.$t('ops.laskExecutionOutput'),
          attrs: {
            type: 'primary',
            label: this.$t('ops.run')
          },
          callbacks: {
            click: function() {
              const taskId = vm.object.latest_execution.id
              window.open(`/#/ops/celery/task/${taskId}/log/`, '', 'width=900,height=600')
            }
          }
        }
      ],
      RunSuccessConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunSuccessHosts'),
        content: {
          hostname: 'linux',
          result: 'api没有该数据==api没有该数据api没有该数据api没有该数据api没有该数据'
        }
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunFailedHosts'),
        content: {
          hostname: 'window',
          result: 'api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
        }
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
            const url = `/ops/adhoc/${data.adhoc}`
            return <a href={ url }>{ data.adhoc_short_id }</a>
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
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.laskExecutionOutput'),
          value: this.object.latest_execution.id,
          formatter: function(row, value) {
            const onClick = function() {
              window.open(`/core/ops/celery/task/${value}/log/`, '', 'width=900,height=600')
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
