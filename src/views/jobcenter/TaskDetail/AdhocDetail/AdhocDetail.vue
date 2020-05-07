<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard type="primary" v-bind="RunSuccessConfig" />
      <RunInfoCard type="info" style="margin-top: 15px" v-bind="RunFailedConfig" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard/index'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../../runinfocard/RunInfoCard'

export default {
  name: 'AdhocDetail',
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
      }
    }
  },
  computed: {
    cardTitle() {
      console.log('this.object===', this.object)
      return 'api 没有该数据'
    },
    detailCardItems() {
      return [
        {
          key: this.$t('jobcenter.ID'),
          value: this.object.id
        },
        {
          key: this.$t('jobcenter.Hosts'),
          value: this.object.hosts.length
        },
        {
          key: this.$t('jobcenter.Pattern'),
          value: this.object.pattern
        },
        {
          key: this.$t('jobcenter.Options'),
          value: this.disPlayOptions(this.object.options)
          // value: this.object.options
        },
        {
          key: this.$t('jobcenter.RunAs'),
          value: this.disPlayRunAs(this.object.run_as_admin, this.object.run_as)
        },
        {
          key: this.$t('jobcenter.Become'),
          value: this.object.become_display
        },
        {
          key: this.$t('jobcenter.CreatedBy'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('jobcenter.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
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
  methods: {
    disPlayRunAs(run_as_admin, run_as) {
      if (run_as_admin) {
        return 'Admin'
      }
      return run_as
    },
    disPlayOptions(options) {
      return options.replace(/:/g, '=').replace(/'/g, '').replace('{', '').replace('}', '')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
