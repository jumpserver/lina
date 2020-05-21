<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard ref="NodeRelation" type="info" style="margin-top: 15px" v-bind="nodeReletionConfig" />
    </el-col>
  </el-row>
</template>a

<script>
import DetailCard from '@/components/DetailCard'
import RelationCard from '@/components/RelationCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    QuickActions,
    RelationCard
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
          title: this.$t('assets.IsActive'),
          type: 'switcher',
          attrs: {
            label: this.$t('common.Test'),
            model: this.object.is_active
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                window.open(`/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                window.open(`/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.PushSystemUserNow'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Push')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'push' }
              ).then(res => {
                window.open(`/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ],
      nodeReletionConfig: {
        icon: 'fa-info',
        title: this.$t('assets.Node'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.full_value, value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.nodes,
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.NodeRelation.iHasObjects
          value.map(v => {
            newData.push(v.value)
          })
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          items.map(v => {
            newData.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: newData }).then(res => {
            this.$message.success(this.$t('common.Update success'))
          }).catch(err => {
            this.$message.error(this.$t('common.Update failed' + ' ' + err))
          })
        },
        performDelete: (item) => {
          const itemId = item.value
          const newData = []
          const value = this.$refs.NodeRelation.iHasObjects
          value.map(v => {
            if (v.value !== itemId) {
              newData.push(v.value)
            }
          })
          const relationUrl = `/api/v1/assets/assets/${this.object.id}/`
          return this.$axios.patch(relationUrl, { nodes: newData }).then(res => {
            this.$message.success(this.$t('common.Update success'))
          }).catch(err => {
            this.$message.error(this.$t('common.Update failed' + ' ' + err))
          })
        }
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Hostname'),
          value: this.object.hostname
        },
        {
          key: this.$t('assets.ip'),
          value: this.object.ip
        },
        {
          key: this.$t('assets.Protocols'),
          value: this.object.protocols
        },
        {
          key: this.$t('assets.PublicIp'),
          value: this.object.public_ip
        },
        {
          key: this.$t('assets.AdminUser'),
          value: this.object.admin_user
        },
        {
          key: this.$t('assets.Domain'),
          value: this.object.domain
        },
        {
          key: this.$t('assets.Vendor'),
          value: this.object.vendor
        },
        {
          key: this.$t('assets.Model'),
          value: this.object.model
        },
        {
          key: this.$t('assets.Cpu'),
          value: this.object.cpu_model
        },
        {
          key: this.$t('assets.Memory'),
          value: this.object.memory
        },
        {
          key: this.$t('assets.Disk'),
          value: this.object.disk_info
        },
        {
          key: this.$t('assets.Platform'),
          value: this.object.platform
        },
        {
          key: this.$t('assets.Os'),
          value: this.object.os_arch
        },
        {
          key: this.$t('assets.IsActive'),
          value: this.object.is_active.toString()
        },
        {
          key: this.$t('assets.SerialNumber'),
          value: this.object.sn
        },
        {
          key: this.$t('assets.AssetNumber'),
          value: this.object.number
        },
        {
          key: this.$t('assets.DateJoined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('assets.Comment'),
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
