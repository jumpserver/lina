<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ LastRunSuccessHosts }}</span>
            </div>
            <div>
              运行成功的主机，请求的api里没有该数据
            </div>
          </el-card>
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ LastRunFailedHosts }}</span>
            </div>
            <div>
              运行失败的主机，请求的api里没有该数据
            </div>
          </el-card>
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

export default {
  name: 'TaskDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    TaskAdhoc,
    TaskHistory
  },
  data() {
    return {
      flag: false,
      taskData: {},
      activeSubMenu: 'detail',
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
      ]
    }
  },
  computed: {
    title() {
      return this.$t('jobcenter.TaskDetail')
    },
    cardTitle() {
      return this.taskData.name
    },
    LastRunSuccessHosts() {
      return this.$t('jobcenter.Last run success hosts')
    },
    LastRunFailedHosts() {
      return this.$t('jobcenter.Last run failed hosts')
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
  .el-table /deep/ .el-table__row > td {
    line-height: 1.5;
    padding: 8px 0;
  }
  .el-table /deep/ .el-table__row > td> div > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .el-table /deep/ .el-table__header > thead > tr >th {
    padding: 8px 0;
    background-color: #F5F5F6;
    font-size: 13px;
    line-height: 1.5;
  }
  .table{
    margin-top: 15px;
  }
</style>
