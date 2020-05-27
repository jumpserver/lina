<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <QuickActions type="primary" :actions="quickActions" />
      <RunInfoCard type="primary" style="margin-top: 15px" v-bind="RunSuccessConfig" />
      <RunInfoCard type="danger" style="margin-top: 15px" v-bind="RunFailedConfig" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../../RunInfoCard'

export default {
  name: 'HistoryExecutionDetail',
  components: {
    DetailCard,
    RunInfoCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('ops.output'),
          attrs: {
            type: 'primary',
            label: this.$t('ops.run')
          },
          callbacks: {
            click: function() {
              const taskId = vm.object.id
              window.open(`/ops/celery/task/${taskId}/log/`, '', 'width=900,height=600')
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
          hostname: 'linux',
          result: 'api没有该数据==api没有该数据api没有该数据api没有该数据api没有该数据'
        }
      }
    }
  },
  computed: {
    cardTitle() {
      return `${this.object.task_display.replace('@', ':')}${this.object.adhoc_short_id}`
    },
    detailCardItems() {
      return [
        {
          key: this.$t('ops.ID'),
          value: this.object.id
        },
        {
          key: this.$t('ops.taskName'),
          value: this.object.task_display.replace('@', '')
        },
        {
          key: this.$t('ops.version'),
          value: this.object.adhoc_short_id
        },
        {
          key: this.$t('ops.dateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
        },
        {
          key: this.$t('ops.timeDelta'),
          value: this.object.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('ops.isFinished'),
          value: this.toChoicesDisplay(this.object.is_finished)
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.toChoicesDisplay(this.object.is_success)
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
