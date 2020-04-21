<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="executionDetail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ SuccessHosts }}</span>
            </div>
            <div>
              运行成功的主机，请求的api里没有该数据
            </div>
          </el-card>
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-info" />
              <span>{{ FailedHosts }}</span>
            </div>
            <div>
              运行失败的主机，请求的api里没有该数据
            </div>
          </el-card>
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

export default {
  name: 'HistoryExecutionDetail',
  components: {
    GenericDetailPage,
    DetailCard
  },
  data() {
    return {
      flag: false,
      defaultValue: '',
      historyExecutionDetailData: {},
      activeSubMenu: 'executionDetail',
      submenu: [
        {
          title: this.$t('jobcenter.ExecutionDetail'),
          name: 'executionDetail'
        },
        {
          title: this.$t('jobcenter.Output'),
          name: 'outPut'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('jobcenter.TaskDetail')
    },
    cardTitle() {
      return `${this.historyExecutionDetailData.task_display}:${this.historyExecutionDetailData.adhoc_short_id}`
    },
    SuccessHosts() {
      return this.$t('jobcenter.SuccessHosts')
    },
    FailedHosts() {
      return this.$t('jobcenter.FailedHosts')
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
