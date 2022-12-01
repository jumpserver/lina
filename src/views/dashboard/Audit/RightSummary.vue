<template>
  <div>
    <div class="box">
      <div class="head">
        <Title :config="config" />
      </div>
      <LineChart v-bind="chartConfig" />
    </div>
    <SummaryCountCard :config="config" :items="summaryItems" class="margin-top-16" />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import LineChart from '../components/LineChart.vue'
import SummaryCountCard from '../components/SummaryCountCard.vue'

export default {
  components: {
    Title,
    LineChart,
    SummaryCountCard
  },
  props: {
    days: {
      type: [Number, String],
      default: 7
    }
  },
  data() {
    return {
      config: {
        title: '批量命令',
        tip: '批量命令'
      },
      chartConfig: {
        datesMetrics: [],
        secondaryName: '指标名称',
        secondaryData: [0]
      },
      data: {
        total_count_online_sessions: 0,
        total_count_history_sessions: 0,
        total_count_ftp_logs: 0
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: '批量命令数',
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_online_sessions,
            disabled: !this.$hasPerm('terminal.view_command')
          }
        },
        {
          title: '未执行批量命令',
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_history_sessions,
            disabled: !this.$hasPerm('terminal.view_command')
          }
        },
        {
          title: '执行失败命令',
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_ftp_logs,
            disabled: !this.$hasPerm('audits.view_command')
          }
        }
      ]
    }
  },
  watch: {
    days() {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      const data = await this.$axios.get(`/api/v1/index/?days=${this.days}
        &total_count_online_sessions=1
        &total_count_history_sessions=1
        &total_count_ftp_logs=1
        &session_dates_metrics=1
      `)
      this.chartConfig.datesMetrics = data.dates_metrics_date
      if (this.chartConfig.secondaryData.length > 1) {
        this.chartConfig.secondaryData = data.dates_metrics_total_count_session
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.margin-top-16 {
  margin-top: 16px;
}
.box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;
  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>
