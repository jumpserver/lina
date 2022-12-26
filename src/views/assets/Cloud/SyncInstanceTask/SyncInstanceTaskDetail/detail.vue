<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
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
      ],
      url: `/api/v1/xpack/cloud/accounts/${this.object.id}`,
      detailFields: [
        'name', 'account_display', 'node_display',
        {
          key: this.$t('xpack.Cloud.LinuxAdminUser'),
          value: this.object.unix_admin_user?.name
        },
        {
          key: this.$t('xpack.Cloud.WindowsAdminUser'),
          value: this.object.windows_admin_user?.name
        },
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols,
          formatter: (item, val) => {
            return <div>{val.map((v) => <el-tag size='small'>{v['name']}/{v['port']}</el-tag>)}</div>
          }
        },
        {
          key: this.$t('xpack.Cloud.IPNetworkSegment'),
          value: this.object.ip_network_segment_group?.join(', ')
        },
        'is_always_update', 'is_periodic', 'periodic_display',
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
        'comment'
      ]
    }
  },
  computed: {
  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang='less' scoped>

</style>
