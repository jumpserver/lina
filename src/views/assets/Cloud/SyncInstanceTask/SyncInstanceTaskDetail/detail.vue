<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('xpack.Cloud.RunTaskManually'),
          attrs: {
            type: 'primary',
            label: this.$t('xpack.Execute'),
            disabled: !this.$hasPerm('xpack.add_syncinstancetaskexecution')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/run/`
              ).then(res => {
                openTaskPage(res['task'])
              }
              )
            }.bind(this)
          }
        }
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('xpack.Cloud.Name'),
          value: this.object.name
        },
        {
          key: this.$t('xpack.Cloud.Account'),
          value: this.object.account_display
        },
        {
          key: this.$t('xpack.Cloud.Node'),
          value: this.object.node_display
        },
        {
          key: this.$t('xpack.Cloud.LinuxAdminUser'),
          value: this.object.unix_admin_user_display
        },
        {
          key: this.$t('xpack.Cloud.WindowsAdminUser'),
          value: this.object.windows_admin_user_display
        },
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols?.join(', ')
        },
        {
          key: this.$t('xpack.Cloud.IPNetworkSegment'),
          value: this.object.ip_network_segment_group?.join(', ')
        },
        {
          key: this.$t('xpack.Cloud.IsAlwaysUpdate'),
          value: (this.object.is_always_update) ? (this.$t('xpack.Cloud.True')) : (this.$t('xpack.Cloud.False'))
        },
        {
          key: this.$t('xpack.Cloud.PeriodicPerform'),
          value: this.object.is_periodic ? (this.$t('xpack.Cloud.True')) : (this.$t('xpack.Cloud.False'))
        },
        {
          key: this.$t('xpack.Cloud.Periodic'),
          value: this.object.periodic_display
        },
        {
          key: this.$t('xpack.Cloud.DateLastSync'),
          value: this.object.date_last_sync ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.DateCreated'),
          value: this.object.date_created ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.Region'),
          value: this.object.regions,
          formatter(row, value) {
            return (<div>{
              value.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
        },
        {
          key: this.$t('xpack.Cloud.Comment'),
          value: this.object.comment
        }
      ]
    }

  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang='less' scoped>

</style>
