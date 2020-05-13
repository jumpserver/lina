<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard type="primary" v-bind="RunSuccessConfig" />
      <RunInfoCard type="danger" style="margin-top: 15px" v-bind="RunFailedConfig" />
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
        title: this.$t('jobcenter.lastRunSuccessHosts'),
        content: [
          {
            hostname: 'linux',
            result: 'api没有该数据==api没有该数据api没有该数据api没有该数据api没有该数据'
          }
        ]
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('jobcenter.lastRunFailedHosts'),
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
          key: this.$t('common.name'),
          value: this.object.name
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('jobcenter.totalVersions'),
          value: JSON.stringify(this.object.summary.total)
        },
        {
          key: this.$t('jobcenter.latestVersion'),
          value: this.object.latest_execution.adhoc_short_id,
          callback: function(row, data) {
            return <a href=''>{ data }</a>
          }
        },
        {
          key: this.$t('jobcenter.lastRun'),
          value: toSafeLocalDateStr(this.object.latest_execution.date_finished)
        },
        {
          key: this.$t('jobcenter.timeDelta'),
          value: this.object.latest_execution.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('jobcenter.isFinished'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_finished)
        },
        {
          key: this.$t('jobcenter.isSuccess'),
          value: this.toChoicesDisplay(this.object.latest_execution.is_success)
        },
        {
          key: this.$t('jobcenter.contents'),
          value: 'api 没有该数据'
        }
      ]
    }
  },
  methods: {
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
