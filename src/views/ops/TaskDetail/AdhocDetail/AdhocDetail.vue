<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RunInfoCard v-for="config in RunSuccessConfigs" :key="config.host" type="info" v-bind="config" />
      <RunInfoCard v-for="config in RunFailedConfigs" :key="config.host" type="danger" style="margin-top: 15px" v-bind="config" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard/index'
import { toSafeLocalDateStr } from '@/utils/common'
import RunInfoCard from '../../RunInfoCard'
import { toLastFailureDisplay, toLastSucessDisplay } from '../business'

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
    const last_success = toLastSucessDisplay(this.object.latest_execution)
    const last_failure = toLastFailureDisplay(this.object.latest_execution)

    return {
      RunSuccessConfigs: last_success.map(host => {
        return {
          icon: 'fa-info',
          title: this.$t('ops.lastRunSuccessHosts'),
          content: {
            hostname: host,
            result: ''
          }
        }
      }),
      RunFailedConfigs: last_failure.map(([host, msg]) => {
        return {
          icon: 'fa-info',
          title: this.$t('ops.lastRunFailedHosts'),
          content: {
            hostname: host,
            result: msg
          }
        }
      })
    }
  },
  computed: {
    cardTitle() {
      return `${this.object.task_name}: ${this.object.short_id}`
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
          value: this.object.created_by
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('ops.runTimes'),
          value: this.object.run_times
        },
        {
          key: this.$t('ops.lastRun'),
          value: this.object.latest_execution.last_run
        },
        {
          key: this.$t('ops.timeDelta'),
          value: this.object.latest_execution.timedelta
        },
        {
          key: this.$t('ops.isFinished'),
          value: this.toBooleanDisplay(this.object.latest_execution.is_finished)
        },
        {
          key: this.$t('ops.isSuccess'),
          value: this.toBooleanDisplay(this.object.latest_execution.is_success)
        },
        {
          key: this.$t('ops.tasks'),
          value: this.toContentsDisplay(this.object.tasks),
          formatter(row, value) {
            return (<div>{
              value.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
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
    },
    toContentsDisplay(contents) {
      const lines = []
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i]
        lines.push(`${i}. ${content.name} ::: ${content.action.module}`)
      }
      return lines
    },
    toBooleanDisplay(value) {
      if (value === true) {
        return this.$t('ops.Yes')
      } else if (value === false) {
        return this.$t('ops.No')
      } else {
        return this.$t('ops.Unkown')
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
