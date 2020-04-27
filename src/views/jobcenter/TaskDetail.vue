<template>
  <GenericDetailPage :object.sync="taskDetail" v-bind="config">
    <div slot="detail">
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
    <div slot="taskVersions">
      <TaskAdhoc />
    </div>
    <div slot="execution">
      <TaskHistory />
    </div>
    <div slot="laskExecutionOutput">
      最后执行输出
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import { toSafeLocalDateStr } from '@/utils/common'
import { getTaskDetail } from '@/api/ops'
import TaskHistory from './TaskHistory'
import TaskAdhoc from './TaskAdhoc'
import RunInfoCard from './runinfocard/RunInfoCard'

export default {
  name: 'TaskDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    TaskAdhoc,
    TaskHistory,
    RunInfoCard
  },
  data() {
    return {
      flag: false,
      taskDetail: { name: '' },
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('jobcenter.TaskDetail'),
            name: 'detail'
          },
          {
            title: this.$t('jobcenter.TaskVersions'),
            name: 'taskVersions'
          },
          {
            title: this.$t('jobcenter.Execution'),
            name: 'execution'
          },
          {
            title: this.$t('jobcenter.LaskExecutionOutput'),
            name: 'laskExecutionOutput'
          }
        ],
        hasRightSide: false
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
      taskData: {}
    }
  },
  computed: {
    cardTitle() {
      return this.taskData.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('jobcenter.ID'),
          value: this.taskData.id
        },
        {
          key: this.$t('common.Name'),
          value: this.taskData.name
        },
        {
          key: this.$t('jobcenter.DateCreated'),
          value: toSafeLocalDateStr(this.taskData.date_created)
        },
        {
          key: this.$t('jobcenter.TotalVersions'),
          value: this.taskData.summary.total
        },
        {
          key: this.$t('jobcenter.LatestVersion'),
          value: this.taskData.latest_execution.adhoc_short_id
        },
        {
          key: this.$t('jobcenter.LastRun'),
          value: toSafeLocalDateStr(this.taskData.latest_execution.date_finished)
        },
        {
          key: this.$t('jobcenter.TimeDelta'),
          value: this.taskData.latest_execution.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('jobcenter.IsFinished'),
          value: this.toChoicesDisplay(this.taskData.latest_execution.is_finished)
        },
        {
          key: this.$t('jobcenter.IsSuccess'),
          value: this.toChoicesDisplay(this.taskData.latest_execution.is_success)
        },
        {
          key: this.$t('jobcenter.Contents'),
          value: 'api 没有该数据'
        }
      ]
    }
  },
  mounted() {
    this.getTaskDetailData()
  },
  methods: {
    getTaskDetailData() {
      getTaskDetail(this.$route.params.id).then(data => {
        this.taskData = data
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
