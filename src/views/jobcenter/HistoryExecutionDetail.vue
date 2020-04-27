<template>
  <GenericDetailPage :object.sync="historyExecutionDetail" v-bind="config">
    <div slot="executionDetail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :span="10">
          <RunInfoCard v-bind="RunSuccessConfig" />
          <RunInfoCard v-bind="RunFailedConfig" />
        </el-col>
      </el-row>
    </div>
    <div slot="outPut">
      输出
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import { getHistoryExecutionDetail } from '@/api/ops'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from './runinfocard/RunInfoCard'

export default {
  name: 'HistoryExecutionDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    RunInfoCard
  },
  data() {
    return {
      flag: false,
      historyExecutionDetail: { name: '' },
      config: {
        activeMenu: 'executionDetail',
        title: this.$t('jobcenter.ExecutionDetail'),
        submenu: [
          {
            title: this.$t('jobcenter.ExecutionDetail'),
            name: 'executionDetail'
          },
          {
            title: this.$t('jobcenter.Output'),
            name: 'outPut'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: `/api/v1/ops/adhoc-executions/${this.$route.params.id}/`
        }
      },
      RunSuccessConfig: {
        icon: 'fa-info',
        title: this.$t('jobcenter.Last run success hosts'),
        content: [
          {
            hostname: 'linux',
            result: 'api没有该数据==api没有该数据api没有该数据api没有该数据api没有该数据'
          }
        ]
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('jobcenter.Last run failed hosts'),
        headerColor: 'danger',
        content: [
          {
            hostname: 'window',
            result: 'api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
          }
        ]
      },
      defaultValue: '',
      historyExecutionDetailData: {}
    }
  },
  computed: {
    cardTitle() {
      return `${this.historyExecutionDetailData.task_display}:${this.historyExecutionDetailData.adhoc_short_id}`
    },
    detailCardItems() {
      return [
        {
          key: this.$t('jobcenter.ID'),
          value: this.historyExecutionDetailData.id
        },
        {
          key: this.$t('jobcenter.TaskName'),
          value: this.historyExecutionDetailData.task_display
        },
        {
          key: this.$t('jobcenter.Version'),
          value: this.historyExecutionDetailData.adhoc_short_id
        },
        {
          key: this.$t('jobcenter.DateStart'),
          value: toSafeLocalDateStr(this.historyExecutionDetailData.date_start)
        },
        {
          key: this.$t('jobcenter.TimeDelta'),
          value: this.historyExecutionDetailData.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('jobcenter.IsFinished'),
          value: this.toChoicesDisplay(this.historyExecutionDetailData.is_finished)
        },
        {
          key: this.$t('jobcenter.IsSuccess'),
          value: this.toChoicesDisplay(this.historyExecutionDetailData.is_success)
        }
      ]
    }
  },
  mounted() {
    this.getHistoryExecutionDetailData()
  },
  methods: {
    getHistoryExecutionDetailData() {
      getHistoryExecutionDetail(this.$route.params.id).then(data => {
        this.historyExecutionDetailData = data
        this.flag = true
      })
    },
    toChoicesDisplay(c) {
      if (!c) {
        return this.$t('jobcenter.No')
      }
      return this.$t('jobcenter.Yes')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
