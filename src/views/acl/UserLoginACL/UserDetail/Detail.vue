<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import QuickActions from '@/components/QuickActions'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

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
            this.$message.success(this.$tc('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
          })
        },
        onAddSuccess: () => {
          this.$refs.RelationCard.$refs.select2.clearSelected()
        }
      },
      quickActions: [
        {
          title: this.$t('common.Active'),
          type: 'switch',
          attrs: {
            model: this.object.is_active
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/acls/login-acls/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      dataVal: [],
      url: `/api/v1/acls/login-acls/${this.object.id}`,
      detailFields: [
        'name', 'user_display',
        {
          key: this.$t('acl.ip_group'),
          value: this.object.rules.ip_group.toString()
        },
        'dataVal', 'action_display', 'priority', 'date_created', 'created_by',
        {
          key: this.$t('acl.login_confirm_user'),
          value: this.object.reviewers.map(item => item.name).join(', ')
        }
      ]
    }
  },
  computed: {
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
