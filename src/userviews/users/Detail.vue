<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10" />
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
    DetailCard
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
          title: this.$t('assets.is_active'),
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
            label: this.$t('common.Test')
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
            label: this.$t('common.Push')
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
        title: this.$t('perms.Add node to this permission'),
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
          value: this.object.username,
          key: this.$t('asset.username')
        },
        {
          value: this.object.name,
          key: this.$t('asset.name')
        },
        {
          value: this.object.role_display,
          key: this.$t('asset.role')
        },
        {
          value: this.object.email,
          key: this.$t('asset.email')
        },
        {
          value: `${this.object.is_active}`,
          key: this.$t('asset.is_active')
        },
        {
          value: `没有这个API`,
          key: this.$t('asset.sshkey')
        },
        {
          value: this.object.mfa_level_display,
          key: this.$t('asset.mfa_level_display')
        }
      ]
    }
  },
  mounted() {
    console.log(this.object)
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>
</style>
