<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard v-bind="RunSuccessConfig" />
      <RunInfoCard v-bind="RunFailedConfig" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard/index'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../runinfocard/RunInfoCard'

export default {
  name: 'TaskDetail',
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
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('jobcenter.ID'),
          value: this.object.id
        },
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('jobcenter.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('jobcenter.TotalVersions'),
          value: this.object.summary.total
        },
        {
          key: this.$t('jobcenter.LatestVersion'),
          value: this.object.latest_execution.adhoc_short_id
        },
        {
          key: this.$t('jobcenter.LastRun'),
          value: toSafeLocalDateStr(this.object.latest_execution.date_finished)
        },
        {
          key: this.$t('jobcenter.TimeDelta'),
          value: this.object.latest_execution.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('jobcenter.IsFinished'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_finished)
        },
        {
          key: this.$t('jobcenter.IsSuccess'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_success)
        },
        {
          key: this.$t('jobcenter.Contents'),
          value: 'api 没有该数据'
        }
      ]
    }
  },
  mounted() {
    // this.getTaskDetailData()
  },
  methods: {
    // getTaskDetailData() {
    //   getTaskDetail(this.$route.params.id).then(data => {
    //     this.taskData = data
    //     this.flag = true
    //   })
    // },
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
