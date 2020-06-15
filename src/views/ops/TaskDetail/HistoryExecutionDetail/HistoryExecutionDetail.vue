<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard v-for="config in RunSuccessConfigs" :key="config.host" type="info" v-bind="config" />
      <RunInfoCard v-for="config in RunFailedConfigs" :key="config.host" type="danger" style="margin-top: 15px" v-bind="config" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../../RunInfoCard'
import { toLastFailureDisplay, toLastSucessDisplay } from '../business'

export default {
  name: 'HistoryExecutionDetail',
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
    const last_success = toLastSucessDisplay(this.object)
    const last_failure = toLastFailureDisplay(this.object)

    return {
      RunSuccessConfigs: last_success.map(host => {
        return {
          icon: 'fa-info',
          title: this.$t('ops.lastRunSuccessHosts'),
          content: {
            hostname: host,
            result: ''
          }
        }
      }),
      RunFailedConfigs: last_failure.map(([host, msg]) => {
        return {
          icon: 'fa-info',
          title: this.$t('ops.lastRunFailedHosts'),
          content: {
            hostname: host,
            result: msg
          }
        }
      })
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
        },
        {
          key: this.$t('ops.output'),
          value: this.object.id,
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
