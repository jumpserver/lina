<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <!--      <RelationCard ref="RelationCard" type="info" v-bind="nodeRelationConfig" />-->
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
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
      if (cur.value.length > 0) {
        let str = ''
        switch (cur.id) {
          case 0:
            str = this.$t('common.WeekCronSelect.Sunday') + ':' + cur.value
            break
          case 1:
            str = this.$t('common.WeekCronSelect.Monday') + ':' + cur.value
            break
          case 2:
            str = this.$t('common.WeekCronSelect.Tuesday') + ':' + cur.value
            break
          case 3:
            str = this.$t('common.WeekCronSelect.Wednesday') + ':' + cur.value
            break
          case 4:
            str = this.$t('common.WeekCronSelect.Thursday') + ':' + cur.value
            break
          case 5:
            str = this.$t('common.WeekCronSelect.Friday') + ':' + cur.value
            break
          case 6:
            str = this.$t('common.WeekCronSelect.Saturday') + ':' + cur.value
            break
        }
        this.dataVal.push(str)
      }
    }
  }
}
</script>

<style lang='less' scoped>
</style>
