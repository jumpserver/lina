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
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.ReplaceNodeAssetsAdminUserWithThis'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        performAdd: (items) => {
          const data = []
          const relationUrl = `/api/v1/assets/admin-users/${this.object.id}/nodes/`
          items.map(v => {
            data.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: data }).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        },
        onAddSuccess: () => {
          this.$refs.RelationCard.$refs.select2.clearSelected()
        }
      },
      quickActions: [
        {
          title: this.$t('common.Active'),
          type: 'switcher',
          attrs: {
            model: this.object.is_active
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/acls/login-acls/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      dataVal: []
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('acl.name'),
          value: this.object.name
        },
        {
          key: this.$t('acl.username'),
          value: this.object.user_display
        },
        {
          key: this.$t('acl.ip_group'),
          value: this.object.rules.ip_group.toString()
        },
        {
          key: this.$t('common.time_period'),
          value: this.dataVal
        },
        {
          key: this.$t('acl.action'),
          value: this.object.action_display
        },
        {
          key: this.$t('acl.priority'),
          value: this.object.priority
        },
        {
          key: this.$t('acl.date_created'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('acl.created_by'),
          value: this.object.created_by
        },
        {
          key: this.$t('acl.login_confirm_user'),
          value: this.object.action === 'confirm' ? this.object.reviewers_display : ''
        }
      ]
    }
  },
  created() {
    const arrs = this.object.rules.time_period
    for (let i = 0; i < arrs.length; i++) {
      const cur = arrs[i]
      let timeStr = cur.value
      if (timeStr.length > 0) {
        const startTime = timeStr.substr(0, cur.value.length - 5)
        let lastTime = timeStr.substr(-5, 5)
        let obj = {}
        if (lastTime.indexOf('00:00') !== -1) {
          lastTime = '24:00'
        }
        timeStr = startTime + lastTime
        switch (cur.id) {
          case 0:
            obj = {
              key: this.$t('common.WeekCronSelect.Sunday'),
              value: timeStr
            }
            break
          case 1:
            obj = {
              key: this.$t('common.WeekCronSelect.Monday'),
              value: timeStr
            }
            break
          case 2:
            obj = {
              key: this.$t('common.WeekCronSelect.Tuesday'),
              value: timeStr
            }
            break
          case 3:
            obj = {
              key: this.$t('common.WeekCronSelect.Wednesday'),
              value: timeStr
            }
            break
          case 4:
            obj = {
              key: this.$t('common.WeekCronSelect.Thursday'),
              value: timeStr
            }
            break
          case 5:
            obj = {
              key: this.$t('common.WeekCronSelect.Friday'),
              value: timeStr
            }
            break
          case 6:
            obj = {
              key: this.$t('common.WeekCronSelect.Saturday'),
              value: timeStr
            }
            break
        }
        this.dataVal.push(obj)
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
