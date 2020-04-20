<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="adhocDetail">
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
        </el-col>
        <el-col :span="10">
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
    <div slot="versionRunExecution">
      <AdhocExecutionHistory />
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import { getAdhocDetail } from '@/api/ops'
import AdhocExecutionHistory from './AdhocExecutionHistory'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AdhocDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    AdhocExecutionHistory
  },
  data() {
    return {
      flag: false,
      adhocData: '',
      versionDetailData: {},
      activeSubMenu: 'adhocDetail',
      submenu: [
        {
          title: this.$t('jobcenter.versionDetail'),
          name: 'adhocDetail'
        },
        {
          title: this.$t('jobcenter.VersionRunExecution'),
          name: 'versionRunExecution'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('jobcenter.TaskDetail')
    },
    cardTitle() {
      return 'api 没有该数据'
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
          value: this.adhocData.id
        },
        {
          key: this.$t('jobcenter.Hosts'),
          value: this.adhocData.hosts.length
        },
        {
          key: this.$t('jobcenter.Pattern'),
          value: this.adhocData.pattern
        },
        {
          key: this.$t('jobcenter.Options'),
          value: this.adhocData.options
        },
        {
          key: this.$t('jobcenter.RunAs'),
          value: this.disPlayRunAs(this.adhocData.run_as_admin, this.adhocData.run_as)
        },
        {
          key: this.$t('jobcenter.Become'),
          value: this.adhocData.become_display
        },
        {
          key: this.$t('jobcenter.CreatedBy'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.DateCreated'),
          value: toSafeLocalDateStr(this.adhocData.date_created)
        },
        {
          key: this.$t('jobcenter.RunTimes'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.LastRun'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.TimeDelta'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.IsFinished'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.IsSuccess'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.Tasks'),
          value: 'api 没有该数据'
        }
      ]
    }
  },
  mounted() {
    this.getAdhocDetailData()
  },
  methods: {
    getAdhocDetailData() {
      getAdhocDetail(this.$route.params.id).then(data => {
        console.log(this.$route.params.id)
        console.log(data)
        this.adhocData = data
        this.flag = true
      })
    },
    disPlayRunAs(run_as_admin, run_as) {
      if (run_as_admin) {
        return 'Admin'
      }
      return run_as
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
