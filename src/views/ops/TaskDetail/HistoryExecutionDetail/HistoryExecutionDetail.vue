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
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../../RunInfoCard'
import { toLastFailureDisplay, toLastSucessDisplay } from '../business'
import { openTaskPage } from '@/utils/jms'

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
    return {
      RunSuccessConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunSuccessHosts'),
        contents: toLastSucessDisplay(this.object)
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunFailedHosts'),
        contents: toLastFailureDisplay(this.object)
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
          value: this.object.is_finished
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.object.is_success
        },
        {
          key: this.$t('ops.output'),
          value: this.object.id,
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
  }
}
</script>

<style lang="less" scoped>

</style>
