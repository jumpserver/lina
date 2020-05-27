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
import RunInfoCard from '../../RunInfoCard'

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
        title: this.$t('ops.lastRunSuccessHosts'),
        content: {
          hostname: 'linux',
          result: 'api没有该数据，api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
        }
      },
      RunFailedConfig: {
        icon: 'fa-info',
        title: this.$t('ops.lastRunFailedHosts'),
        content: {
          hostname: 'window',
          result: 'api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据api没有该数据'
        }
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
          key: this.$t('ops.ID'),
          value: this.object.id
        },
        {
          key: this.$t('ops.hosts'),
          value: JSON.stringify(this.object.hosts.length)
        },
        {
          key: this.$t('ops.pattern'),
          value: this.object.pattern
        },
        {
          key: this.$t('ops.options'),
          value: this.disPlayOptions(this.object.options)
          // value: this.object.options
        },
        {
          key: this.$t('ops.runAs'),
          value: this.disPlayRunAs(this.object.run_as_admin, this.object.run_as)
        },
        {
          key: this.$t('ops.become'),
          value: this.object.become_display
        },
        {
          key: this.$t('common.createBy'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('ops.runTimes'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.lastRun'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.timeDelta'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.isFinished'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.isSuccess'),
          value: 'api 没有该数据'
        },
        {
          key: this.$t('ops.tasks'),
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
