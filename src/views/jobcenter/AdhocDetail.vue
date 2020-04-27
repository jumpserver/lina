<template>
  <GenericDetailPage :object.sync="adhocDetail" v-bind="config">
    <div slot="adhocDetail">
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
import RunInfoCard from './runinfocard/RunInfoCard'

export default {
  name: 'AdhocDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    AdhocExecutionHistory,
    RunInfoCard
  },
  data() {
    return {
      flag: false,
      adhocDetail: { name: '' },
      config: {
        activeMenu: 'adhocDetail',
        title: this.$t('jobcenter.TaskDetail'),
        submenu: [
          {
            title: this.$t('jobcenter.versionDetail'),
            name: 'adhocDetail'
          },
          {
            title: this.$t('jobcenter.VersionRunExecution'),
            name: 'versionRunExecution'
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
            result: 'api没有该数据，api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
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
            result: 'api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
          }
        ]
      },
      adhocData: '',
      versionDetailData: {}
    }
  },
  computed: {
    cardTitle() {
      return 'api 没有该数据'
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

</style>
